from django.urls import path
from .views import (
    PaymentCheckerView, PaymentVerifyView,
    paymob_webhook, fawry_webhook
)

urlpatterns = [
    path('payment_checker/', PaymentCheckerView.as_view(), name='payment-checker'),
    path('verify/', PaymentVerifyView.as_view(), name='payment-verify'),
    path('webhooks/paymob/', paymob_webhook, name='paymob-webhook'),
    path('webhooks/fawry/', fawry_webhook, name='fawry-webhook'),
]