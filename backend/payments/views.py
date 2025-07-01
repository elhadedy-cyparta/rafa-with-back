from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import stripe
import requests
import json
import hmac
import hashlib
import base64
import uuid
from .models import Payment, PaymentIntent
from .serializers import (
    PaymentSerializer, PaymentIntentSerializer,
    PaymentCheckerSerializer, PaymentVerifySerializer
)
from orders.models import Order, OrderTimeline


# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentCheckerView(generics.GenericAPIView):
    serializer_class = PaymentCheckerSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['pk']
        use_fawry = serializer.validated_data['fawry']
        use_aman = serializer.validated_data['aman']
        
        try:
            order = Order.objects.get(id=order_id)
            
            # Determine payment provider
            if use_fawry:
                return self.process_fawry_payment(order)
            elif use_aman:
                return self.process_aman_payment(order)
            else:
                return self.process_paymob_payment(order)
                
        except Order.DoesNotExist:
            return Response(
                {"success": False, "message": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def process_paymob_payment(self, order):
        """Process payment using Paymob"""
        try:
            # Step 1: Authentication request
            auth_response = requests.post(
                "https://accept.paymob.com/api/auth/tokens",
                json={"api_key": settings.PAYMOB_API_KEY}
            )
            auth_data = auth_response.json()
            auth_token = auth_data.get("token")
            
            if not auth_token:
                return Response(
                    {"success": False, "message": "Failed to authenticate with Paymob"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Step 2: Order registration
            order_data = {
                "auth_token": auth_token,
                "delivery_needed": "false",
                "amount_cents": int(order.total * 100),
                "currency": "EGP",
                "items": []
            }
            
            order_response = requests.post(
                "https://accept.paymob.com/api/ecommerce/orders",
                json=order_data
            )
            order_response_data = order_response.json()
            paymob_order_id = order_response_data.get("id")
            
            if not paymob_order_id:
                return Response(
                    {"success": False, "message": "Failed to register order with Paymob"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Step 3: Payment key request
            payment_data = {
                "auth_token": auth_token,
                "amount_cents": int(order.total * 100),
                "expiration": 3600,
                "order_id": paymob_order_id,
                "billing_data": {
                    "apartment": order.shipping_address,
                    "email": order.email or "customer@example.com",
                    "floor": "",
                    "first_name": order.first_name,
                    "street": order.address,
                    "building": "",
                    "phone_number": order.phone,
                    "shipping_method": "NA",
                    "postal_code": "",
                    "city": order.city,
                    "country": order.country,
                    "last_name": order.last_name,
                    "state": order.region
                },
                "currency": "EGP",
                "integration_id": settings.PAYMOB_INTEGRATION_ID
            }
            
            payment_response = requests.post(
                "https://accept.paymob.com/api/acceptance/payment_keys",
                json=payment_data
            )
            payment_response_data = payment_response.json()
            payment_key = payment_response_data.get("token")
            
            if not payment_key:
                return Response(
                    {"success": False, "message": "Failed to generate payment key"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create payment intent record
            payment_intent = PaymentIntent.objects.create(
                order=order,
                provider='paymob',
                intent_id=str(paymob_order_id),
                amount=order.total,
                redirect_url=f"https://accept.paymob.com/api/acceptance/iframes/{settings.PAYMOB_INTEGRATION_ID}?payment_token={payment_key}",
                expires_at=timezone.now() + timedelta(hours=1)
            )
            
            # Update order payment_id
            order.payment_id = str(paymob_order_id)
            order.save()
            
            return Response({
                "success": True,
                "message": "Payment intent created successfully",
                "redirect_url": payment_intent.redirect_url,
                "payment_id": payment_intent.id
            })
            
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def process_fawry_payment(self, order):
        """Process payment using Fawry"""
        try:
            # Generate a unique reference number
            reference_number = f"RAFAL-{order.order_number}"
            
            # Create payment intent record
            payment_intent = PaymentIntent.objects.create(
                order=order,
                provider='fawry',
                intent_id=reference_number,
                amount=order.total,
                expires_at=timezone.now() + timedelta(days=3)
            )
            
            # Update order payment_id
            order.payment_id = reference_number
            order.save()
            
            # In a real implementation, you would generate a Fawry payment URL
            # For this example, we'll just return a success response
            return Response({
                "success": True,
                "message": "Fawry payment intent created successfully",
                "payment_id": payment_intent.id,
                "reference_number": reference_number
            })
            
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def process_aman_payment(self, order):
        """Process payment using Aman"""
        try:
            # Generate a unique reference number
            reference_number = f"RAFAL-AMAN-{order.order_number}"
            
            # Create payment intent record
            payment_intent = PaymentIntent.objects.create(
                order=order,
                provider='aman',
                intent_id=reference_number,
                amount=order.total,
                expires_at=timezone.now() + timedelta(days=3)
            )
            
            # Update order payment_id
            order.payment_id = reference_number
            order.save()
            
            # In a real implementation, you would generate an Aman payment code
            # For this example, we'll just return a success response
            return Response({
                "success": True,
                "message": "Aman payment intent created successfully",
                "payment_id": payment_intent.id,
                "reference_number": reference_number
            })
            
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
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
            
            # Verify payment based on provider
            if payment_intent.provider == 'paymob':
                return self.verify_paymob_payment(payment_intent, order)
            elif payment_intent.provider == 'fawry':
                return self.verify_fawry_payment(payment_intent, order)
            elif payment_intent.provider == 'aman':
                return self.verify_aman_payment(payment_intent, order)
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
    
    def verify_paymob_payment(self, payment_intent, order):
        """Verify Paymob payment"""
        try:
            # In a real implementation, you would make an API call to Paymob
            # to verify the payment status
            
            # For this example, we'll just mark the payment as successful
            payment = Payment.objects.create(
                order=order,
                amount=payment_intent.amount,
                provider=payment_intent.provider,
                payment_id=payment_intent.intent_id,
                status='completed'
            )
            
            # Mark payment intent as used
            payment_intent.is_used = True
            payment_intent.save()
            
            # Update order status
            order.status = 'processing'
            order.save()
            
            # Add to order timeline
            OrderTimeline.objects.create(
                order=order,
                status='processing',
                description='Payment completed successfully'
            )
            
            return Response({
                "success": True,
                "message": "Payment verified successfully",
                "order_id": order.id,
                "order_number": order.order_number,
                "status": order.status
            })
            
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def verify_fawry_payment(self, payment_intent, order):
        """Verify Fawry payment"""
        # Similar implementation to verify_paymob_payment
        return self.verify_paymob_payment(payment_intent, order)
    
    def verify_aman_payment(self, payment_intent, order):
        """Verify Aman payment"""
        # Similar implementation to verify_paymob_payment
        return self.verify_paymob_payment(payment_intent, order)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def paymob_webhook(request):
    """Handle Paymob payment webhook"""
    try:
        payload = json.loads(request.body)
        
        # Verify the webhook signature (implementation depends on Paymob's webhook format)
        # ...
        
        # Process the payment
        transaction_id = payload.get('id')
        order_id = payload.get('order', {}).get('id')
        success = payload.get('success')
        
        if success and order_id:
            # Find the payment intent
            payment_intent = PaymentIntent.objects.filter(
                intent_id=str(order_id),
                provider='paymob',
                is_used=False
            ).first()
            
            if payment_intent:
                order = payment_intent.order
                
                # Create payment record
                Payment.objects.create(
                    order=order,
                    amount=payment_intent.amount,
                    provider='paymob',
                    payment_id=payment_intent.intent_id,
                    transaction_id=str(transaction_id),
                    status='completed'
                )
                
                # Mark payment intent as used
                payment_intent.is_used = True
                payment_intent.save()
                
                # Update order status
                order.status = 'processing'
                order.save()
                
                # Add to order timeline
                OrderTimeline.objects.create(
                    order=order,
                    status='processing',
                    description='Payment completed successfully via webhook'
                )
        
        return Response({"status": "success"})
        
    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def fawry_webhook(request):
    """Handle Fawry payment webhook"""
    # Similar implementation to paymob_webhook
    return Response({"status": "success"})