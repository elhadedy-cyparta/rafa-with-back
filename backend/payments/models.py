from django.db import models
from django.utils.translation import gettext_lazy as _
from orders.models import Order


class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('refunded', _('Refunded')),
    )
    
    PAYMENT_PROVIDER_CHOICES = (
        ('paymob', _('Paymob')),
        ('fawry', _('Fawry')),
        ('aman', _('Aman')),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    provider = models.CharField(_('provider'), max_length=20, choices=PAYMENT_PROVIDER_CHOICES)
    payment_id = models.CharField(_('payment ID'), max_length=255)
    transaction_id = models.CharField(_('transaction ID'), max_length=255, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    error_message = models.TextField(_('error message'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('payment')
        verbose_name_plural = _('payments')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.id} - {self.order.order_number} - {self.status}"


class PaymentIntent(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payment_intents')
    provider = models.CharField(_('provider'), max_length=20, choices=Payment.PAYMENT_PROVIDER_CHOICES)
    intent_id = models.CharField(_('intent ID'), max_length=255)
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='EGP')
    redirect_url = models.URLField(_('redirect URL'), blank=True)
    is_used = models.BooleanField(_('is used'), default=False)
    expires_at = models.DateTimeField(_('expires at'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('payment intent')
        verbose_name_plural = _('payment intents')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Intent {self.intent_id} - {self.order.order_number}"