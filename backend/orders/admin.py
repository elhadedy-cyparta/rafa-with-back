from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, OrderTimeline


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('total',)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_key', 'item_count', 'total', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__phone', 'session_key')
    readonly_fields = ('total', 'item_count')
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'product_name', 'product_price', 'color_name', 
                      'color_hex', 'quantity', 'total')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


class OrderTimelineInline(admin.TabularInline):
    model = OrderTimeline
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'payment_method', 
                   'total', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'user__phone', 'first_name', 'last_name', 'phone')
    readonly_fields = ('order_number', 'subtotal', 'total')
    inlines = [OrderItemInline, OrderTimelineInline]
    fieldsets = (
        (None, {
            'fields': ('order_number', 'user', 'status', 'payment_method', 'payment_id')
        }),
        ('Customer Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Shipping Information', {
            'fields': ('address', 'city', 'region', 'country', 'shipping_address')
        }),
        ('Order Totals', {
            'fields': ('subtotal', 'delivery_fee', 'total')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        
        # If status changed, add to timeline
        if change and 'status' in form.changed_data:
            OrderTimeline.objects.create(
                order=obj,
                status=obj.status,
                description=f"Order status changed to {obj.get_status_display()}"
            )


@admin.register(OrderTimeline)
class OrderTimelineAdmin(admin.ModelAdmin):
    list_display = ('order', 'status', 'description', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order__order_number', 'description')
    raw_id_fields = ('order',)