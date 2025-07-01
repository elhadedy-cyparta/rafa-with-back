from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Advertisement(models.Model):
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    image_ad = models.ImageField(_('image'), upload_to='ads/')
    link = models.URLField(_('link'), blank=True)
    priority = models.PositiveIntegerField(_('priority'), default=0, 
                                         help_text=_('Higher priority ads will be shown first'))
    start_date = models.DateTimeField(_('start date'), default=timezone.now)
    end_date = models.DateTimeField(_('end date'), null=True, blank=True)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('advertisement')
        verbose_name_plural = _('advertisements')
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_valid(self):
        """Check if the ad is currently valid based on start/end dates"""
        now = timezone.now()
        if self.start_date and self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        return True