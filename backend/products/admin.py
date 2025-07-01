from django.contrib import admin
from .models import (
    Category, Product, ProductImage, ProductColor, 
    ProductFeature, ProductTag, ProductReview
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductColorInline(admin.TabularInline):
    model = ProductColor
    extra = 1


class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 3


class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'order', 'is_active')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('order', 'is_active')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'is_active', 'in_stock', 'is_featured', 'is_best_seller', 'is_offer')
    list_filter = ('is_active', 'in_stock', 'is_featured', 'is_best_seller', 'is_offer', 'category')
    search_fields = ('name', 'description', 'sku')
    list_editable = ('price', 'is_active', 'in_stock', 'is_featured', 'is_best_seller', 'is_offer')
    inlines = [ProductColorInline, ProductFeatureInline, ProductImageInline, ProductReviewInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'category', 'image')
        }),
        ('Pricing', {
            'fields': ('price', 'original_price')
        }),
        ('Status', {
            'fields': ('is_active', 'in_stock', 'stock_quantity', 'is_featured', 'is_best_seller', 'is_offer')
        }),
        ('Details', {
            'fields': ('sku', 'weight', 'dimensions', 'warranty', 'brand')
        }),
    )


@admin.register(ProductTag)
class ProductTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ('products',)


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved', 'created_at')
    search_fields = ('product__name', 'user__phone', 'comment')
    list_editable = ('is_approved',)
    raw_id_fields = ('product', 'user')