from rest_framework import serializers
from .models import PaymobPayment, PaymobCallback
from orders.models import Order


class PaymobPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymobPayment
        fields = [
            'id', 'order', 'paymob_order_id', 'payment_key', 'integration_id',
            'amount_cents', 'hmac', 'status', 'is_3d_secure', 'is_refunded',
            'is_voided', 'redirect_url', 'iframe_url', 'transaction_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymobCallbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymobCallback
        fields = [
            'id', 'payment', 'transaction_id', 'order_id', 'amount_cents',
            'success', 'is_3d_secure', 'is_refunded', 'is_voided',
            'error_occured', 'has_parent_transaction', 'source_data_type',
            'raw_data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PaymobProcessSerializer(serializers.Serializer):
    order_id = serializers.CharField(help_text="Order ID to process payment for")
    
    def validate_order_id(self, value):
        try:
            order = Order.objects.get(id=value)
            if order.status != 'pending':
                raise serializers.ValidationError("Order is not in pending status")
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")


class PaymobVerifySerializer(serializers.Serializer):
    payment_id = serializers.CharField(help_text="Payment intent ID to verify")
    transaction_id = serializers.CharField(required=False, help_text="Paymob transaction ID")