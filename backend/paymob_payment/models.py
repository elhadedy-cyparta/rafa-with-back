from django.db import models
from django.utils.translation import gettext_lazy as _
from orders.models import Order


class PaymobPayment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', _('Pending')),
        ('SUCCESS', _('Success')),
        ('FAILED', _('Failed')),
        ('VOIDED', _('Voided')),
        ('REFUNDED', _('Refunded')),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='paymob_payments')
    paymob_order_id = models.CharField(_('Paymob order ID'), max_length=255)
    payment_key = models.CharField(_('payment key'), max_length=255)
    integration_id = models.CharField(_('integration ID'), max_length=255)
    amount_cents = models.PositiveIntegerField(_('amount in cents'))
    hmac = models.CharField(_('HMAC'), max_length=255, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    is_3d_secure = models.BooleanField(_('is 3D secure'), default=False)
    is_refunded = models.BooleanField(_('is refunded'), default=False)
    is_voided = models.BooleanField(_('is voided'), default=False)
    redirect_url = models.URLField(_('redirect URL'), blank=True)
    iframe_url = models.URLField(_('iframe URL'), blank=True)
    transaction_id = models.CharField(_('transaction ID'), max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Paymob payment')
        verbose_name_plural = _('Paymob payments')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Paymob Payment {self.paymob_order_id} - {self.order.order_number} - {self.status}"


class PaymobCallback(models.Model):
    payment = models.ForeignKey(PaymobPayment, on_delete=models.CASCADE, related_name='callbacks', null=True, blank=True)
    transaction_id = models.CharField(_('transaction ID'), max_length=255)
    order_id = models.CharField(_('order ID'), max_length=255)
    amount_cents = models.PositiveIntegerField(_('amount in cents'))
    success = models.BooleanField(_('success'))
    is_3d_secure = models.BooleanField(_('is 3D secure'))
    is_refunded = models.BooleanField(_('is refunded'))
    is_voided = models.BooleanField(_('is voided'))
    error_occured = models.BooleanField(_('error occurred'))
    has_parent_transaction = models.BooleanField(_('has parent transaction'))
    source_data_type = models.CharField(_('source data type'), max_length=50, blank=True)
    raw_data = models.JSONField(_('raw data'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Paymob callback')
        verbose_name_plural = _('Paymob callbacks')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Paymob Callback {self.transaction_id} - {self.success}"