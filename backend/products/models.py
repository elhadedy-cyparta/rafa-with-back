from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True)
    image = models.ImageField(_('image'), upload_to='categories/', blank=True)
    wall_image = models.ImageField(_('wall image'), upload_to='categories/wall/', blank=True, 
                                help_text=_('Background image for category display'))
    cat_image = models.ImageField(_('category image'), upload_to='categories/cat/', blank=True,
                                help_text=_('Icon or thumbnail for category'))
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True, 
                             related_name='children')
    order = models.PositiveIntegerField(_('display order'), default=0)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    original_price = models.DecimalField(_('original price'), max_digits=10, decimal_places=2, 
                                       blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    image = models.ImageField(_('main image'), upload_to='products/')
    is_active = models.BooleanField(_('active'), default=True)
    is_featured = models.BooleanField(_('featured'), default=False)
    is_best_seller = models.BooleanField(_('best seller'), default=False)
    is_offer = models.BooleanField(_('on offer'), default=False)
    in_stock = models.BooleanField(_('in stock'), default=True)
    stock_quantity = models.PositiveIntegerField(_('stock quantity'), default=0)
    sku = models.CharField(_('SKU'), max_length=50, blank=True)
    weight = models.DecimalField(_('weight (kg)'), max_digits=6, decimal_places=2, 
                               blank=True, null=True)
    dimensions = models.CharField(_('dimensions'), max_length=100, blank=True,
                                help_text=_('Format: LxWxH in cm'))
    warranty = models.CharField(_('warranty'), max_length=100, blank=True)
    brand = models.CharField(_('brand'), max_length=100, default='RAFAL')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('product')
        verbose_name_plural = _('products')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def discount_percentage(self):
        if self.original_price and self.price < self.original_price:
            return int(((self.original_price - self.price) / self.original_price) * 100)
        return 0
    
    @property
    def rating(self):
        reviews = self.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / reviews.count()
        return 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(_('image'), upload_to='products/gallery/')
    color = models.ForeignKey('ProductColor', on_delete=models.SET_NULL, 
                            related_name='images', blank=True, null=True)
    is_primary = models.BooleanField(_('primary image'), default=False)
    order = models.PositiveIntegerField(_('display order'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('product image')
        verbose_name_plural = _('product images')
        ordering = ['order']
    
    def __str__(self):
        return f"Image for {self.product.name}"


class ProductColor(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(_('color name'), max_length=50)
    hex_value = models.CharField(_('hex color code'), max_length=7, 
                               help_text=_('Format: #RRGGBB'))
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2, 
                              help_text=_('Price for this color variant'))
    old_price = models.DecimalField(_('old price'), max_digits=10, decimal_places=2, 
                                  blank=True, null=True)
    quantity = models.PositiveIntegerField(_('stock quantity'), default=0)
    is_active = models.BooleanField(_('active'), default=True)
    
    class Meta:
        verbose_name = _('product color')
        verbose_name_plural = _('product colors')
        unique_together = ('product', 'name')
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')
    feature = models.CharField(_('feature'), max_length=255)
    order = models.PositiveIntegerField(_('display order'), default=0)
    
    class Meta:
        verbose_name = _('product feature')
        verbose_name_plural = _('product features')
        ordering = ['order']
    
    def __str__(self):
        return f"{self.product.name} - {self.feature[:30]}"


class ProductTag(models.Model):
    name = models.CharField(_('name'), max_length=50, unique=True)
    slug = models.SlugField(_('slug'), max_length=50, unique=True, blank=True)
    products = models.ManyToManyField(Product, related_name='tags')
    
    class Meta:
        verbose_name = _('product tag')
        verbose_name_plural = _('product tags')
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(_('comment'), blank=True)
    is_approved = models.BooleanField(_('approved'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('product review')
        verbose_name_plural = _('product reviews')
        ordering = ['-created_at']
        unique_together = ('product', 'user')
    
    def __str__(self):
        return f"{self.user.phone} - {self.product.name} ({self.rating}★)"