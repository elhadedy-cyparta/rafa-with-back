from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import Payment, PaymentIntent
from .serializers import (
    PaymentSerializer, PaymentIntentSerializer,
    PaymentCheckerSerializer, PaymentVerifySerializer
)
from orders.models import Order, OrderTimeline


class PaymentCheckerView(generics.GenericAPIView):
    serializer_class = PaymentCheckerSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['pk']
        provider = serializer.validated_data['provider']
        
        try:
            order = Order.objects.get(id=order_id)
            
            # Redirect to the appropriate payment provider
            if provider == 'fawry':
                return Response({
                    "success": True,
                    "message": "Use Fawry payment API",
                    "redirect": f"/api/payments/fawry/process/{order_id}/"
                })
            elif provider == 'paymob':
                return Response({
                    "success": True,
                    "message": "Use Paymob payment API",
                    "redirect": f"/api/payments/paymob/process/{order_id}/"
                })
            else:
                return Response({
                    "success": False,
                    "message": f"Unsupported payment provider: {provider}"
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Order.DoesNotExist:
            return Response(
                {"success": False, "message": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class PaymentVerifyView(generics.GenericAPIView):
    serializer_class = PaymentVerifySerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment_id = serializer.validated_data['payment_id']
        
        try:
            payment_intent = PaymentIntent.objects.get(id=payment_id)
            order = payment_intent.order
            
            # Check if payment is already processed
            if payment_intent.is_used:
                return Response({
                    "success": True,
                    "message": "Payment already processed",
                    "order_id": order.id,
                    "order_number": order.order_number,
                    "status": order.status
                })
            
            # Redirect to the appropriate payment provider for verification
            if payment_intent.provider == 'paymob':
                return Response({
                    "success": True,
                    "message": "Use Paymob verification API",
                    "redirect": f"/api/payments/paymob/verify/{payment_id}/"
                })
            elif payment_intent.provider == 'fawry':
                return Response({
                    "success": True,
                    "message": "Use Fawry verification API",
                    "redirect": f"/api/payments/fawry/verify/{payment_id}/"
                })
            else:
                return Response(
                    {"success": False, "message": "Unsupported payment provider"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except PaymentIntent.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment intent not found"},
                status=status.HTTP_404_NOT_FOUND
            )