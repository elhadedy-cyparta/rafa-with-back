from django.urls import path
from .views import PaymentCheckerView, PaymentVerifyView

urlpatterns = [
    path('payment_checker/', PaymentCheckerView.as_view(), name='payment-checker'),
    path('verify/', PaymentVerifyView.as_view(), name='payment-verify'),
]