from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['buyer_name', 'buyer_email', 'package', 'price', 'payment_method', 'link'] # <-- ADICIONE 'link' AQUI
