from rest_framework import serializers
from .models import FawryPayment, FawryCallback
from orders.models import Order


class FawryPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FawryPayment
        fields = [
            'id', 'order', 'reference_number', 'merchant_reference_number',
            'amount', 'status', 'payment_method', 'expiry_date',
            'customer_name', 'customer_mobile', 'customer_email',
            'payment_code', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FawryCallbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = FawryCallback
        fields = [
            'id', 'payment', 'reference_number', 'merchant_reference_number',
            'payment_amount', 'payment_method', 'payment_status',
            'payment_date', 'raw_data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class FawryProcessSerializer(serializers.Serializer):
    order_id = serializers.CharField(help_text="Order ID to process payment for")
    
    def validate_order_id(self, value):
        try:
            order = Order.objects.get(id=value)
            if order.status != 'pending':
                raise serializers.ValidationError("Order is not in pending status")
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")


class FawryVerifySerializer(serializers.Serializer):
    payment_id = serializers.CharField(help_text="Payment intent ID to verify")
    reference_number = serializers.CharField(required=False, help_text="Fawry reference number")