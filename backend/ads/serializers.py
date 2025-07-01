from rest_framework import serializers
from .models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'description', 'image_ad', 'link', 
            'priority', 'start_date', 'end_date', 'is_active', 
            'is_valid', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']