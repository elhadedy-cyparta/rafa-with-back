from rest_framework import serializers
from django.utils.crypto import get_random_string
from .models import Cart, CartItem, Order, OrderItem, OrderTimeline
from products.models import Product, ProductColor
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    color_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    color_name = serializers.CharField(read_only=True, source='color.name')
    color_hex = serializers.CharField(read_only=True, source='color.hex_value')
    total = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_id', 'color_id', 'color_name', 
            'color_hex', 'quantity', 'total', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate(self, attrs):
        product_id = attrs.get('product_id')
        color_id = attrs.get('color_id')
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product not found or inactive"})
        
        if not product.in_stock:
            raise serializers.ValidationError({"product_id": "Product is out of stock"})
        
        # Validate color if provided
        if color_id:
            try:
                color = ProductColor.objects.get(id=color_id, product=product, is_active=True)
                if color.quantity <= 0:
                    raise serializers.ValidationError({"color_id": "Selected color is out of stock"})
            except ProductColor.DoesNotExist:
                raise serializers.ValidationError({"color_id": "Color not found or inactive"})
        
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    item_count = serializers.IntegerField(read_only=True)
    delivery = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'session_key', 'items', 'total', 'item_count', 'delivery', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_delivery(self, obj):
        # Calculate delivery fee based on total
        total = obj.total
        if total >= 500:  # Free delivery for orders over 500 EGP
            return 0
        return 50  # Default delivery fee


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price', 
            'color_name', 'color_hex', 'quantity', 'total'
        ]
        read_only_fields = ['id']


class OrderTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimeline
        fields = ['id', 'status', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderTimelineSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'first_name', 'last_name', 
            'email', 'phone', 'address', 'city', 'region', 'country',
            'shipping_address', 'payment_method', 'payment_id', 'status',
            'subtotal', 'delivery_fee', 'total', 'notes', 'items', 
            'timeline', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'subtotal', 'total', 
            'created_at', 'updated_at'
        ]


class CheckoutSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    second_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, default='Egypt')
    city = serializers.CharField(max_length=100)
    region = serializers.CharField(max_length=100)
    address = serializers.CharField()
    apartment = serializers.CharField(required=False, allow_blank=True)
    shipping_address = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=['Cash', 'Card'])
    session_key = serializers.CharField(required=False, allow_blank=True)
    
    def validate_phone(self, value):
        # Format phone number to include +20 prefix if not already present
        if not value.startswith('+'):
            value = '+20' + value.lstrip('0')
        return value


class DirectBuySerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    second_name = serializers.CharField(max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, default='Egypt')
    city = serializers.CharField(max_length=100)
    region = serializers.CharField(max_length=100)
    address = serializers.CharField()
    apartment = serializers.CharField(required=False, allow_blank=True)
    shipping_address = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=['Cash', 'Card'])
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    color_hex = serializers.CharField(required=False, allow_blank=True)
    
    def validate_phone(self, value):
        # Format phone number to include +20 prefix if not already present
        if not value.startswith('+'):
            value = '+20' + value.lstrip('0')
        return value
    
    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
            if not product.in_stock:
                raise serializers.ValidationError("Product is out of stock")
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive")
        return value