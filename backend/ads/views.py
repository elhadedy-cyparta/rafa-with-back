from rest_framework import viewsets, permissions
from django.utils import timezone
from .models import Advertisement
from .serializers import AdvertisementSerializer
from django.db import models

from django.db.models import Q


class AdvertisementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        now = timezone.now()
        return (
            Advertisement.objects.filter(is_active=True, start_date__lte=now)
            .filter(models.Q(end_date__isnull=True) | models.Q(end_date__gte=now))
            .order_by("-priority", "-created_at")
        )
