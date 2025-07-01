from django.contrib import admin
from .models import FawryPayment, FawryCallback


@admin.register(FawryPayment)
class FawryPaymentAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'order', 'amount', 'status', 'expiry_date', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('reference_number', 'merchant_reference_number', 'order__order_number', 'customer_name', 'customer_mobile')
    readonly_fields = ('reference_number', 'merchant_reference_number', 'created_at', 'updated_at')
    raw_id_fields = ('order',)


@admin.register(FawryCallback)
class FawryCallbackAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'payment', 'payment_status', 'payment_amount', 'payment_date', 'created_at')
    list_filter = ('payment_status', 'created_at')
    search_fields = ('reference_number', 'merchant_reference_number')
    readonly_fields = ('reference_number', 'merchant_reference_number', 'payment_amount', 'payment_method', 'payment_status', 'payment_date', 'raw_data', 'created_at')
    raw_id_fields = ('payment',)