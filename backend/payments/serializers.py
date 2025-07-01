from rest_framework import serializers
from .models import Payment, PaymentIntent
from orders.models import Order


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'provider', 'payment_id',
            'transaction_id', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentIntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentIntent
        fields = [
            'id', 'order', 'provider', 'intent_id', 'amount',
            'currency', 'redirect_url', 'is_used', 'expires_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PaymentCheckerSerializer(serializers.Serializer):
    pk = serializers.CharField(help_text="Order ID")
    fawry = serializers.BooleanField(default=False, help_text="Use Fawry payment")
    aman = serializers.BooleanField(default=False, help_text="Use Aman payment")
    
    def validate_pk(self, value):
        try:
            order = Order.objects.get(id=value)
            if order.status != 'pending':
                raise serializers.ValidationError("Order is not in pending status")
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")


class PaymentVerifySerializer(serializers.Serializer):
    payment_id = serializers.CharField(help_text="Payment ID to verify")