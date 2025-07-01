from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Address


@receiver(post_save, sender=User)
def create_default_address(sender, instance, created, **kwargs):
    """
    Create a default shipping address for new users.
    """
    if created:
        # Only create default address if user has first_name and last_name
        if instance.first_name and instance.last_name:
            Address.objects.create(
                user=instance,
                address_type='shipping',
                first_name=instance.first_name,
                last_name=instance.last_name,
                phone=instance.phone,
                email=instance.email,
                country='Egypt',
                city='',
                region='',
                address='',
                is_default=True
            )