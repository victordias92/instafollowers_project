from django.db import models
from django.utils import timezone

class Order(models.Model):
    # Dados do comprador
    buyer_name = models.CharField(max_length=100)
    buyer_email = models.EmailField()
    link = models.URLField(max_length=500, blank=True, null=True)
    # Dados do pedido
    order_id = models.CharField(max_length=100, blank=True)
    package = models.CharField(max_length=100, default='Standard') # Removida a vírgula
    price = models.DecimalField(max_digits=10, decimal_places=2, 
                               default=0.00 ) # Removida a vírgu

    # Pagamento
    payment_status = models.CharField(
        max_length=50,
        default='pending'
    )  # pending, paid, failed
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)

    # QR Code
    qr_code = models.TextField(blank=True, null=True)  # base64 ou string do payload do QR
    qr_expires_at = models.DateTimeField(blank=True, null=True)

    # Resposta completa da API
    raw_response = models.JSONField(blank=True, null=True)

    # Controle interno
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_id} - {self.payment_status}"
