from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdvertisementViewSet

router = DefaultRouter()
router.register(r'', AdvertisementViewSet, basename='advertisement')

urlpatterns = [
    path('', include(router.urls)),
]