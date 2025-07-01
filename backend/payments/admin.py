from django.contrib import admin
from .models import Payment, PaymentIntent


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'provider', 'status', 'created_at')
    list_filter = ('provider', 'status', 'created_at')
    search_fields = ('order__order_number', 'payment_id', 'transaction_id')
    raw_id_fields = ('order',)


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'provider', 'amount', 'is_used', 'expires_at', 'created_at')
    list_filter = ('provider', 'is_used', 'created_at')
    search_fields = ('order__order_number', 'intent_id')
    raw_id_fields = ('order',)