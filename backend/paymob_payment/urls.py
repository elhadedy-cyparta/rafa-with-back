from django.urls import path
from .views import PaymobProcessView, PaymobVerifyView, paymob_webhook

urlpatterns = [
    path('process/<str:order_id>/', PaymobProcessView.as_view(), name='paymob-process'),
    path('verify/<str:payment_id>/', PaymobVerifyView.as_view(), name='paymob-verify'),
    path('webhook/', paymob_webhook, name='paymob-webhook'),
]