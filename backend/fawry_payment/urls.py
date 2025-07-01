from django.urls import path
from .views import FawryProcessView, FawryVerifyView, fawry_webhook

urlpatterns = [
    path('process/<str:order_id>/', FawryProcessView.as_view(), name='fawry-process'),
    path('verify/<str:payment_id>/', FawryVerifyView.as_view(), name='fawry-verify'),
    path('webhook/', fawry_webhook, name='fawry-webhook'),
]