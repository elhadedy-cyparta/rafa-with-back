from django.db import models
from django.utils.translation import gettext_lazy as _
from orders.models import Order


class FawryPayment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('UNPAID', _('Unpaid')),
        ('PAID', _('Paid')),
        ('EXPIRED', _('Expired')),
        ('REFUNDED', _('Refunded')),
        ('FAILED', _('Failed')),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='fawry_payments')
    reference_number = models.CharField(_('reference number'), max_length=255, unique=True)
    merchant_reference_number = models.CharField(_('merchant reference number'), max_length=255, unique=True)
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    status = models.CharField(_('status'), max_length=20, choices=PAYMENT_STATUS_CHOICES, default='UNPAID')
    payment_method = models.CharField(_('payment method'), max_length=50, default='PAYATFAWRY')
    expiry_date = models.DateTimeField(_('expiry date'))
    customer_name = models.CharField(_('customer name'), max_length=255)
    customer_mobile = models.CharField(_('customer mobile'), max_length=20)
    customer_email = models.EmailField(_('customer email'), blank=True)
    payment_code = models.CharField(_('payment code'), max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Fawry payment')
        verbose_name_plural = _('Fawry payments')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Fawry Payment {self.reference_number} - {self.order.order_number} - {self.status}"


class FawryCallback(models.Model):
    payment = models.ForeignKey(FawryPayment, on_delete=models.CASCADE, related_name='callbacks')
    reference_number = models.CharField(_('reference number'), max_length=255)
    merchant_reference_number = models.CharField(_('merchant reference number'), max_length=255)
    payment_amount = models.DecimalField(_('payment amount'), max_digits=10, decimal_places=2)
    payment_method = models.CharField(_('payment method'), max_length=50)
    payment_status = models.CharField(_('payment status'), max_length=20)
    payment_date = models.DateTimeField(_('payment date'))
    raw_data = models.JSONField(_('raw data'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Fawry callback')
        verbose_name_plural = _('Fawry callbacks')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Fawry Callback {self.reference_number} - {self.payment_status}"