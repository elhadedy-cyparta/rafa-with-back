from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.crypto import get_random_string
from django.db import transaction
from django.utils import timezone
from .models import Cart, CartItem, Order, OrderItem, OrderTimeline
from .serializers import (
    CartSerializer, CartItemSerializer, OrderSerializer,
    CheckoutSerializer, DirectBuySerializer
)
from products.models import Product, ProductColor


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        session_key = self.request.query_params.get('session_key')
        
        if user.is_authenticated:
            return Cart.objects.filter(user=user)
        elif session_key:
            return Cart.objects.filter(session_key=session_key)
        return Cart.objects.none()
    
    def get_object(self):
        user = self.request.user
        session_key = self.request.query_params.get('session_key')
        
        # Try to get cart by user or session key
        if user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=user)
            
            # If we have a session key and a new cart was not created,
            # merge any existing session cart with the user's cart
            if session_key and not created:
                self.merge_carts(session_key, cart)
                
            return cart
        elif session_key:
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
            return cart
        
        # If no user or session key, create a new cart with a new session key
        new_session_key = get_random_string(length=32)
        cart = Cart.objects.create(session_key=new_session_key)
        return cart
    
    def merge_carts(self, session_key, user_cart):
        """Merge items from session cart into user cart"""
        try:
            session_cart = Cart.objects.get(session_key=session_key)
            
            # Transfer items from session cart to user cart
            for item in session_cart.items.all():
                # Check if this product+color combo already exists in user cart
                existing_item = CartItem.objects.filter(
                    cart=user_cart,
                    product=item.product,
                    color=item.color
                ).first()
                
                if existing_item:
                    # Update quantity of existing item
                    existing_item.quantity += item.quantity
                    existing_item.save()
                else:
                    # Create new item in user cart
                    item.pk = None  # Create a new instance
                    item.cart = user_cart
                    item.save()
            
            # Delete the session cart
            session_cart.delete()
        except Cart.DoesNotExist:
            pass
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        cart = self.get_object()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def clear(self, request, pk=None):
        cart = self.get_object()
        cart.items.all().delete()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    
    def get_queryset(self):
        cart = self.get_cart()
        return CartItem.objects.filter(cart=cart)
    
    def get_cart(self):
        user = self.request.user
        session_key = self.request.query_params.get('session_key')
        
        if user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=user)
            return cart
        elif session_key:
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
            return cart
        
        # If no user or session key, create a new cart with a new session key
        new_session_key = get_random_string(length=32)
        cart = Cart.objects.create(session_key=new_session_key)
        return cart
    
    def perform_create(self, serializer):
        cart = self.get_cart()
        product_id = serializer.validated_data['product_id']
        color_id = serializer.validated_data.get('color_id')
        quantity = serializer.validated_data.get('quantity', 1)
        
        product = Product.objects.get(id=product_id)
        color = None
        if color_id:
            color = ProductColor.objects.get(id=color_id, product=product)
        
        # Check if this product+color combo already exists in cart
        try:
            cart_item = CartItem.objects.get(cart=cart, product=product, color=color)
            # Update quantity
            cart_item.quantity += quantity
            cart_item.save()
        except CartItem.DoesNotExist:
            # Create new cart item
            serializer.save(cart=cart, product=product, color=color)
    
    @action(detail=False, methods=['post'])
    def add_to_cart(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the updated cart
        cart = self.get_cart()
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)
    
    @action(detail=False, methods=['post'])
    def remove_from_cart(self, request):
        cart = self.get_cart()
        item_id = request.data.get('cartitem_id')
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            
            # Return the updated cart
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['patch'])
    def update_quantity(self, request):
        cart = self.get_cart()
        item_id = request.data.get('cartitem_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            
            if quantity <= 0:
                cart_item.delete()
            else:
                cart_item.quantity = quantity
                cart_item.save()
            
            # Return the updated cart
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class CheckoutView(generics.GenericAPIView):
    serializer_class = CheckoutSerializer
    permission_classes = [permissions.AllowAny]
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get or create cart
        user = request.user if request.user.is_authenticated else None
        session_key = serializer.validated_data.get('session_key')
        
        if user:
            cart = Cart.objects.filter(user=user).first()
        elif session_key:
            cart = Cart.objects.filter(session_key=session_key).first()
        else:
            return Response(
                {"detail": "No cart found. Please provide a session_key or login."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not cart or cart.items.count() == 0:
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate totals
        subtotal = cart.total
        delivery_fee = 0 if subtotal >= 500 else 50
        total = subtotal + delivery_fee
        
        # Create order
        order = Order.objects.create(
            user=user,
            order_number=f"ORD-{get_random_string(length=8).upper()}",
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['second_name'],
            email=serializer.validated_data.get('email', ''),
            phone=serializer.validated_data['phone'],
            address=serializer.validated_data['address'],
            city=serializer.validated_data['city'],
            region=serializer.validated_data['region'],
            country=serializer.validated_data['country'],
            shipping_address=serializer.validated_data['shipping_address'],
            payment_method=serializer.validated_data['payment_method'].lower(),
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total
        )
        
        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price if not cart_item.color else cart_item.color.price,
                color_name=cart_item.color.name if cart_item.color else '',
                color_hex=cart_item.color.hex_value if cart_item.color else '',
                quantity=cart_item.quantity,
                total=cart_item.total
            )
        
        # Create initial timeline entry
        OrderTimeline.objects.create(
            order=order,
            status='pending',
            description='Order placed successfully'
        )
        
        # Clear the cart
        cart.items.all().delete()
        
        # Return order details
        order_serializer = OrderSerializer(order)
        return Response({
            "success": True,
            "id": order.id,
            "order_number": order.order_number,
            "message": "Order placed successfully",
            "order": order_serializer.data
        }, status=status.HTTP_201_CREATED)


class DirectBuyView(generics.GenericAPIView):
    serializer_class = DirectBuySerializer
    permission_classes = [permissions.AllowAny]
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get product and validate
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        color_hex = serializer.validated_data.get('color_hex', '')
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
            if not product.in_stock:
                return Response(
                    {"detail": "Product is out of stock."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Find color if hex value provided
        color = None
        if color_hex:
            color = ProductColor.objects.filter(
                product=product, 
                hex_value=color_hex,
                is_active=True
            ).first()
        
        # Calculate price based on color if available
        price = color.price if color else product.price
        
        # Calculate totals
        subtotal = price * quantity
        delivery_fee = 0 if subtotal >= 500 else 50
        total = subtotal + delivery_fee
        
        # Get user if authenticated
        user = request.user if request.user.is_authenticated else None
        
        # Create order
        order = Order.objects.create(
            user=user,
            order_number=f"ORD-{get_random_string(length=8).upper()}",
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['second_name'],
            email=serializer.validated_data.get('email', ''),
            phone=serializer.validated_data['phone'],
            address=serializer.validated_data['address'],
            city=serializer.validated_data['city'],
            region=serializer.validated_data['region'],
            country=serializer.validated_data['country'],
            shipping_address=serializer.validated_data['shipping_address'],
            payment_method=serializer.validated_data['payment_method'].lower(),
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total
        )
        
        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            product_price=price,
            color_name=color.name if color else '',
            color_hex=color.hex_value if color else '',
            quantity=quantity,
            total=subtotal
        )
        
        # Create initial timeline entry
        OrderTimeline.objects.create(
            order=order,
            status='pending',
            description='Order placed successfully'
        )
        
        # Return order details
        order_serializer = OrderSerializer(order)
        return Response({
            "success": True,
            "id": order.id,
            "order_number": order.order_number,
            "message": "Order placed successfully",
            "order": order_serializer.data
        }, status=status.HTTP_201_CREATED)