from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    path('api/order', views.CreateOrder, name='pedido'),
    path('api/create_preference', csrf_exempt(views.CreatePreferenceView.as_view()), name='create_preference'),
    path('home/', views.home, name='home'),
    path('', views.home, name='home'),
    path('payment_status/', views.verify_payment, name='payment_status'),
    path('success/', views.success, name='success'),
    path('failure/', views.failure, name='failure'),
    path('pending/', views.pending, name='pending'),
    path('api/emitir_ordem_api_five/<int:order_id>/', views.emitir_ordem_api_five, name='emitir_ordem_api_five'),
    path("api/payment/webhook/", views.payment_webhook, name="payment_webhook"),

]
