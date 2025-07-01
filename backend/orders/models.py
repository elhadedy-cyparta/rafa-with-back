from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from products.models import Product, ProductColor


class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='carts',
        null=True, blank=True
    )
    session_key = models.CharField(_('session key'), max_length=40, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('cart')
        verbose_name_plural = _('carts')
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Cart {self.id} - {self.user.phone if self.user else 'Anonymous'}"
    
    @property
    def total(self):
        return sum(item.total for item in self.items.all())
    
    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    color = models.ForeignKey(ProductColor, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(_('quantity'), default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('cart item')
        verbose_name_plural = _('cart items')
        ordering = ['-created_at']
        unique_together = ('cart', 'product', 'color')
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    @property
    def total(self):
        if self.color and self.color.price:
            return self.color.price * self.quantity
        return self.product.price * self.quantity


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('shipped', _('Shipped')),
        ('delivered', _('Delivered')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('cash', _('Cash on Delivery')),
        ('card', _('Credit Card')),
        ('fawry', _('Fawry')),
        ('aman', _('Aman')),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        related_name='orders',
        null=True, blank=True
    )
    order_number = models.CharField(_('order number'), max_length=20, unique=True)
    first_name = models.CharField(_('first name'), max_length=100)
    last_name = models.CharField(_('last name'), max_length=100)
    email = models.EmailField(_('email'), blank=True)
    phone = models.CharField(_('phone'), max_length=20)
    address = models.TextField(_('address'))
    city = models.CharField(_('city'), max_length=100)
    region = models.CharField(_('region'), max_length=100)
    country = models.CharField(_('country'), max_length=100, default='Egypt')
    shipping_address = models.TextField(_('shipping address'))
    payment_method = models.CharField(_('payment method'), max_length=10, 
                                    choices=PAYMENT_METHOD_CHOICES, default='cash')
    payment_id = models.CharField(_('payment ID'), max_length=100, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(_('subtotal'), max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(_('delivery fee'), max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(_('total'), max_digits=10, decimal_places=2)
    notes = models.TextField(_('notes'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('order')
        verbose_name_plural = _('orders')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_name = models.CharField(_('product name'), max_length=255)
    product_price = models.DecimalField(_('product price'), max_digits=10, decimal_places=2)
    color_name = models.CharField(_('color name'), max_length=50, blank=True)
    color_hex = models.CharField(_('color hex'), max_length=7, blank=True)
    quantity = models.PositiveIntegerField(_('quantity'), default=1)
    total = models.DecimalField(_('total'), max_digits=10, decimal_places=2)
    
    class Meta:
        verbose_name = _('order item')
        verbose_name_plural = _('order items')
    
    def __str__(self):
        return f"{self.quantity} x {self.product_name}"


class OrderTimeline(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(_('status'), max_length=20, choices=Order.STATUS_CHOICES)
    description = models.CharField(_('description'), max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('order timeline')
        verbose_name_plural = _('order timelines')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.status}"