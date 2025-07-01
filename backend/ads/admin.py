from django.contrib import admin
from .models import Advertisement


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'is_active', 'start_date', 'end_date', 'is_valid')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('title', 'description')
    list_editable = ('priority', 'is_active')
    readonly_fields = ('is_valid',)
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'image_ad', 'link')
        }),
        ('Display Settings', {
            'fields': ('priority', 'is_active')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'is_valid')
        }),
    )
    
    def is_valid(self, obj):
        return obj.is_valid
    is_valid.boolean = True
    is_valid.short_description = 'Currently Valid'