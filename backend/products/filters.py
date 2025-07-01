import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name='category__id')
    category_ids = django_filters.CharFilter(method='filter_category_ids')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='icontains')
    in_stock = django_filters.BooleanFilter(field_name='in_stock')
    is_offer = django_filters.BooleanFilter(field_name='is_offer')
    is_best_seller = django_filters.BooleanFilter(field_name='is_best_seller')
    
    def filter_category_ids(self, queryset, name, value):
        """
        Filter products by multiple category IDs separated by commas.
        Example: ?category_ids=1,2,3
        """
        if value:
            category_ids = [int(x) for x in value.split(',') if x.isdigit()]
            if category_ids:
                return queryset.filter(category__id__in=category_ids)
        return queryset
    
    class Meta:
        model = Product
        fields = [
            'category', 'brand', 'in_stock', 'is_offer', 
            'is_best_seller', 'min_price', 'max_price'
        ]