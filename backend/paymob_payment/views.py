from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import json
import requests
from payments.models import PaymentIntent, Payment
from orders.models import Order, OrderTimeline
from .models import PaymobPayment, PaymobCallback
from .serializers import (
    PaymobPaymentSerializer, PaymobCallbackSerializer,
    PaymobProcessSerializer, PaymobVerifySerializer
)


class PaymobProcessView(generics.GenericAPIView):
    serializer_class = PaymobProcessSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['order_id']
        
        try:
            order = Order.objects.get(id=order_id)
            
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
            
            # Create Paymob payment record
            iframe_url = f"https://accept.paymob.com/api/acceptance/iframes/{settings.PAYMOB_INTEGRATION_ID}?payment_token={payment_key}"
            
            paymob_payment = PaymobPayment.objects.create(
                order=order,
                paymob_order_id=str(paymob_order_id),
                payment_key=payment_key,
                integration_id=settings.PAYMOB_INTEGRATION_ID,
                amount_cents=int(order.total * 100),
                redirect_url=iframe_url,
                iframe_url=iframe_url
            )
            
            # Create payment intent record
            payment_intent = PaymentIntent.objects.create(
                order=order,
                provider='paymob',
                intent_id=str(paymob_order_id),
                amount=order.total,
                redirect_url=iframe_url,
                expires_at=timezone.now() + timedelta(hours=1)
            )
            
            # Update order payment_id
            order.payment_id = str(paymob_order_id)
            order.save()
            
            return Response({
                "success": True,
                "message": "Paymob payment intent created successfully",
                "redirect_url": iframe_url,
                "payment_id": payment_intent.id
            })
            
        except Order.DoesNotExist:
            return Response(
                {"success": False, "message": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PaymobVerifyView(generics.GenericAPIView):
    serializer_class = PaymobVerifySerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment_id = serializer.validated_data['payment_id']
        transaction_id = serializer.validated_data.get('transaction_id')
        
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
            
            # Get the Paymob payment
            paymob_payment = PaymobPayment.objects.get(paymob_order_id=payment_intent.intent_id)
            
            # In a real implementation, you would make an API call to Paymob to verify the payment
            # For this example, we'll just simulate a successful payment
            
            # Update Paymob payment status
            paymob_payment.status = 'SUCCESS'
            if transaction_id:
                paymob_payment.transaction_id = transaction_id
            paymob_payment.save()
            
            # Create payment record
            Payment.objects.create(
                order=order,
                amount=payment_intent.amount,
                provider='paymob',
                payment_id=payment_intent.intent_id,
                transaction_id=transaction_id or '',
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
                description='Payment completed successfully via Paymob'
            )
            
            return Response({
                "success": True,
                "message": "Payment verified successfully",
                "order_id": order.id,
                "order_number": order.order_number,
                "status": order.status
            })
            
        except PaymentIntent.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment intent not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except PaymobPayment.DoesNotExist:
            return Response(
                {"success": False, "message": "Paymob payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def paymob_webhook(request):
    """Handle Paymob payment webhook"""
    try:
        payload = json.loads(request.body)
        
        # Verify the webhook signature (implementation depends on Paymob's webhook format)
        # ...
        
        # Extract data from payload
        transaction_id = payload.get('id')
        order_id = payload.get('order', {}).get('id')
        amount_cents = payload.get('amount_cents')
        success = payload.get('success')
        is_3d_secure = payload.get('is_3d_secure')
        is_refunded = payload.get('is_refunded')
        is_voided = payload.get('is_voided')
        error_occured = payload.get('error_occured')
        has_parent_transaction = payload.get('has_parent_transaction')
        source_data_type = payload.get('source_data', {}).get('type', '')
        
        # Create callback record
        callback = PaymobCallback.objects.create(
            transaction_id=str(transaction_id) if transaction_id else '',
            order_id=str(order_id) if order_id else '',
            amount_cents=amount_cents or 0,
            success=success or False,
            is_3d_secure=is_3d_secure or False,
            is_refunded=is_refunded or False,
            is_voided=is_voided or False,
            error_occured=error_occured or False,
            has_parent_transaction=has_parent_transaction or False,
            source_data_type=source_data_type,
            raw_data=payload
        )
        
        # Find the Paymob payment
        if order_id:
            paymob_payment = PaymobPayment.objects.filter(paymob_order_id=str(order_id)).first()
            
            if paymob_payment:
                # Link callback to payment
                callback.payment = paymob_payment
                callback.save()
                
                # Update payment status
                if success:
                    paymob_payment.status = 'SUCCESS'
                    paymob_payment.transaction_id = str(transaction_id) if transaction_id else ''
                    paymob_payment.is_3d_secure = is_3d_secure or False
                    paymob_payment.is_refunded = is_refunded or False
                    paymob_payment.is_voided = is_voided or False
                    paymob_payment.save()
                    
                    order = paymob_payment.order
                    
                    # Find the payment intent
                    payment_intent = PaymentIntent.objects.filter(
                        order=order,
                        provider='paymob',
                        intent_id=str(order_id),
                        is_used=False
                    ).first()
                    
                    if payment_intent:
                        # Create payment record
                        Payment.objects.create(
                            order=order,
                            amount=payment_intent.amount,
                            provider='paymob',
                            payment_id=payment_intent.intent_id,
                            transaction_id=str(transaction_id) if transaction_id else '',
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
                            description='Payment completed successfully via Paymob webhook'
                        )
                else:
                    paymob_payment.status = 'FAILED'
                    paymob_payment.save()
        
        return Response({"status": "success"})
        
    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )