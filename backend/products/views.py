from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Category, Product, ProductReview
)
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductReviewSerializer
)
from .filters import ProductFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order']
    ordering = ['order', 'name']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'sku', 'brand']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured = Product.objects.filter(is_active=True, is_featured=True)
        page = self.paginate_queryset(featured)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def best_sellers(self, request):
        best_sellers = Product.objects.filter(is_active=True, is_best_seller=True)
        page = self.paginate_queryset(best_sellers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(best_sellers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def offers(self, request):
        offers = Product.objects.filter(is_active=True, is_offer=True)
        page = self.paginate_queryset(offers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(offers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, pk=None):
        product = self.get_object()
        
        if request.method == 'GET':
            reviews = product.reviews.filter(is_approved=True)
            serializer = ProductReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        
        # POST method - add a review
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required to post a review."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user already reviewed this product
        if ProductReview.objects.filter(product=product, user=request.user).exists():
            return Response(
                {"detail": "You have already reviewed this product."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ProductReviewSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        product = self.get_object()
        related = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:6]
        serializer = ProductListSerializer(related, many=True)
        return Response(serializer.data)