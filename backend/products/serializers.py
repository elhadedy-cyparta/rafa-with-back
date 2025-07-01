from rest_framework import serializers
from .models import (
    Category, Product, ProductImage, ProductColor, 
    ProductFeature, ProductTag, ProductReview
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'image', 'wall_image', 
            'cat_image', 'parent', 'order', 'is_active'
        ]


class ProductColorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'order']


class ProductColorSerializer(serializers.ModelSerializer):
    images = ProductColorImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductColor
        fields = [
            'id', 'name', 'hex_value', 'price', 'old_price', 
            'quantity', 'is_active', 'images'
        ]


class ProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ['id', 'feature', 'order']


class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = ['id', 'name', 'slug']


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'user_name', 'rating', 'comment', 
            'is_approved', 'created_at'
        ]
        read_only_fields = ['user', 'is_approved', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.phone
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'color', 'is_primary', 'order']


class ProductSerializer(serializers.ModelSerializer):
    """Basic product serializer for use in other apps"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'original_price', 'image',
            'category', 'category_name', 'in_stock'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'original_price', 'category', 
            'category_name', 'image', 'is_best_seller', 'is_offer',
            'in_stock', 'discount_percentage', 'rating', 'reviews_count'
        ]
    
    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    colors = ProductColorSerializer(many=True, read_only=True)
    features = ProductFeatureSerializer(many=True, read_only=True)
    tags = ProductTagSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'original_price', 
            'category', 'category_name', 'image', 'images', 'colors',
            'features', 'tags', 'is_active', 'is_featured', 
            'is_best_seller', 'is_offer', 'in_stock', 'stock_quantity',
            'sku', 'weight', 'dimensions', 'warranty', 'brand',
            'discount_percentage', 'rating', 'reviews_count', 'reviews',
            'created_at', 'updated_at'
        ]
    
    def get_reviews_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()