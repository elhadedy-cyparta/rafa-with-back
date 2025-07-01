from django.contrib import admin
from .models import PaymobPayment, PaymobCallback


@admin.register(PaymobPayment)
class PaymobPaymentAdmin(admin.ModelAdmin):
    list_display = ('paymob_order_id', 'order', 'amount_cents', 'status', 'is_3d_secure', 'created_at')
    list_filter = ('status', 'is_3d_secure', 'is_refunded', 'is_voided', 'created_at')
    search_fields = ('paymob_order_id', 'order__order_number', 'transaction_id')
    readonly_fields = ('paymob_order_id', 'payment_key', 'created_at', 'updated_at')
    raw_id_fields = ('order',)


@admin.register(PaymobCallback)
class PaymobCallbackAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'payment', 'success', 'amount_cents', 'created_at')
    list_filter = ('success', 'is_3d_secure', 'is_refunded', 'is_voided', 'created_at')
    search_fields = ('transaction_id', 'order_id')
    readonly_fields = ('transaction_id', 'order_id', 'amount_cents', 'success', 'is_3d_secure', 'is_refunded', 'is_voided', 'error_occured', 'has_parent_transaction', 'source_data_type', 'raw_data', 'created_at')
    raw_id_fields = ('payment',)