from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import hashlib
import hmac
import json
import uuid
import requests
from payments.models import PaymentIntent, Payment
from orders.models import Order, OrderTimeline
from .models import FawryPayment, FawryCallback
from .serializers import (
    FawryPaymentSerializer, FawryCallbackSerializer,
    FawryProcessSerializer, FawryVerifySerializer
)


class FawryProcessView(generics.GenericAPIView):
    serializer_class = FawryProcessSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['order_id']
        
        try:
            order = Order.objects.get(id=order_id)
            
            # Generate a unique reference number
            merchant_ref_number = f"RAFAL-{order.order_number}"
            reference_number = str(uuid.uuid4())
            
            # Calculate expiry date (3 days from now)
            expiry_date = timezone.now() + timedelta(days=3)
            
            # Create Fawry payment record
            fawry_payment = FawryPayment.objects.create(
                order=order,
                reference_number=reference_number,
                merchant_reference_number=merchant_ref_number,
                amount=order.total,
                expiry_date=expiry_date,
                customer_name=f"{order.first_name} {order.last_name}",
                customer_mobile=order.phone,
                customer_email=order.email or ""
            )
            
            # Create payment intent record
            payment_intent = PaymentIntent.objects.create(
                order=order,
                provider='fawry',
                intent_id=reference_number,
                amount=order.total,
                expires_at=expiry_date
            )
            
            # Update order payment_id
            order.payment_id = reference_number
            order.save()
            
            # Generate signature
            merchant_code = settings.FAWRY_MERCHANT_CODE
            merchant_ref_num = merchant_ref_number
            customer_profile_id = order.phone.replace('+', '')
            payment_method = "PAYATFAWRY"
            amount = str(order.total)
            signature_items = [
                merchant_code, merchant_ref_num, customer_profile_id,
                payment_method, amount, settings.FAWRY_SECRET_KEY
            ]
            signature_string = ''.join(signature_items)
            signature = hashlib.md5(signature_string.encode('utf-8')).hexdigest()
            
            # Prepare Fawry payment data
            payment_data = {
                "merchantCode": merchant_code,
                "merchantRefNum": merchant_ref_num,
                "customerProfileId": customer_profile_id,
                "customerName": f"{order.first_name} {order.last_name}",
                "customerMobile": order.phone,
                "customerEmail": order.email or "",
                "paymentMethod": payment_method,
                "amount": float(order.total),
                "currencyCode": "EGP",
                "description": f"Payment for order {order.order_number}",
                "chargeItems": [
                    {
                        "itemId": str(item.product.id),
                        "description": item.product_name,
                        "price": float(item.product_price),
                        "quantity": item.quantity
                    } for item in order.items.all()
                ],
                "signature": signature
            }
            
            # In a real implementation, you would make an API call to Fawry
            # For this example, we'll just return the payment data
            
            # Update the payment code
            fawry_payment.payment_code = "12345678"  # This would come from Fawry API
            fawry_payment.save()
            
            return Response({
                "success": True,
                "message": "Fawry payment intent created successfully",
                "payment_id": payment_intent.id,
                "reference_number": reference_number,
                "payment_code": fawry_payment.payment_code,
                "expiry_date": expiry_date.isoformat(),
                "payment_data": payment_data
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


class FawryVerifyView(generics.GenericAPIView):
    serializer_class = FawryVerifySerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment_id = serializer.validated_data['payment_id']
        reference_number = serializer.validated_data.get('reference_number')
        
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
            
            # Get the Fawry payment
            fawry_payment = FawryPayment.objects.get(reference_number=payment_intent.intent_id)
            
            # In a real implementation, you would make an API call to Fawry to verify the payment
            # For this example, we'll just simulate a successful payment
            
            # Update Fawry payment status
            fawry_payment.status = 'PAID'
            fawry_payment.save()
            
            # Create payment record
            Payment.objects.create(
                order=order,
                amount=payment_intent.amount,
                provider='fawry',
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
                description='Payment completed successfully via Fawry'
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
        except FawryPayment.DoesNotExist:
            return Response(
                {"success": False, "message": "Fawry payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def fawry_webhook(request):
    """Handle Fawry payment webhook"""
    try:
        payload = json.loads(request.body)
        
        # Verify the webhook signature
        # In a real implementation, you would verify the signature from Fawry
        
        reference_number = payload.get('referenceNumber')
        merchant_ref_number = payload.get('merchantRefNumber')
        payment_status = payload.get('paymentStatus')
        payment_amount = payload.get('paymentAmount')
        payment_method = payload.get('paymentMethod')
        payment_date = payload.get('paymentDate')
        
        if not reference_number or not payment_status:
            return Response(
                {"status": "error", "message": "Invalid webhook payload"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the Fawry payment
        try:
            fawry_payment = FawryPayment.objects.get(reference_number=reference_number)
        except FawryPayment.DoesNotExist:
            return Response(
                {"status": "error", "message": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Record the callback
        FawryCallback.objects.create(
            payment=fawry_payment,
            reference_number=reference_number,
            merchant_reference_number=merchant_ref_number,
            payment_amount=payment_amount,
            payment_method=payment_method,
            payment_status=payment_status,
            payment_date=payment_date,
            raw_data=payload
        )
        
        # Update payment status
        if payment_status == 'PAID':
            fawry_payment.status = 'PAID'
            fawry_payment.save()
            
            order = fawry_payment.order
            
            # Find the payment intent
            payment_intent = PaymentIntent.objects.filter(
                order=order,
                provider='fawry',
                intent_id=reference_number,
                is_used=False
            ).first()
            
            if payment_intent:
                # Create payment record
                Payment.objects.create(
                    order=order,
                    amount=payment_intent.amount,
                    provider='fawry',
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
                    description='Payment completed successfully via Fawry webhook'
                )
        
        return Response({"status": "success"})
        
    except Exception as e:
        return Response(
            {"status": "error", "message": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )