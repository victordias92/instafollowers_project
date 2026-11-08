import os
import json
import mercadopago
import requests
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .view_helpers import process_merchant_order_and_update_order
import dotenv
from .models import Order
from .api_five import Api
from .fulfillment import dispatch_order_to_api_five

# ===== CONFIG (usar variáveis de ambiente) =====
  # ex: token de teste ou produção
   # ex: TEST-... ou APP_USR-...
MP_ENV = os.getenv('MP_ENV', 'production')         # 'sandbox' ou 'production'
MP_NOTIFICATION_URL = os.getenv('MP_NOTIFICATION_URL') or 'https://grumpily-staple-endanger.ngrok-free.dev/api/payment/webhook/'
BACK_URL_SUCCESS = os.getenv('BACK_URL_SUCCESS') or 'https://grumpily-staple-endanger.ngrok-free.dev/success/'
BACK_URL_FAILURE = os.getenv('BACK_URL_FAILURE') or 'https://grumpily-staple-endanger.ngrok-free.dev/failure/'
BACK_URL_PENDING = os.getenv('BACK_URL_PENDING') or 'https://grumpily-staple-endanger.ngrok-free.dev/pending/'

# validação mínima de configuração
import os
import requests
import mercadopago
from django.core.exceptions import ImproperlyConfigured

# 1. Validação do Token do Mercado Pago (Deve ser o de Produção 'APP_USR-...')
MP_ACCESS_TOKEN = os.getenv('MP_ACCESS_TOKEN')
if not MP_ACCESS_TOKEN:
    raise ImproperlyConfigured('MP_ACCESS_TOKEN não definido nas variáveis de ambiente')

if MP_ACCESS_TOKEN.startswith('TEST-'):
    print("[AVISO DE CONFIGURAÇÃO] Você está usando um token 'TEST-', garanta que seja o 'APP_USR-' para produção!")

# Inicializa o SDK oficial com o token de produção
sdk = mercadopago.SDK(MP_ACCESS_TOKEN)


# 2. Correção da API Externa (Buscando a variável de ambiente corretamente)
# IMPORTANTE: Nunca deixe a string da chave direto no código por segurança. 
# Defina o nome da variável no seu arquivo .env, por exemplo: API_FIVE_KEY=c3e410cd9504ac83fb68c21b79a9c814
API_KEY_EXTERNA = os.getenv('API_FIVE_KEY')
if not API_KEY_EXTERNA:
    raise ImproperlyConfigured('API_FIVE_KEY não definido nas variáveis de ambiente')
api = Api(api_key=API_KEY_EXTERNA)


# 3. Configuração do ambiente fixado para Produção
MP_ENV = 'production'


def _parse_webhook_request(request):
    body = {}
    if request.body:
        try:
            body = json.loads(request.body.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            body = {}

    topic = request.GET.get("topic") or body.get("type") or body.get("topic")
    payment_id = (
        request.GET.get("id")
        or request.GET.get("data.id")
        or body.get("data", {}).get("id")
        or body.get("id")
        or body.get("collection_id")
    )

    merchant_order_id = None
    if topic == "merchant_order":
        merchant_order_id = payment_id

    return topic, payment_id, merchant_order_id, body

# ===== Helpers =====
def is_test_key(key):
    return False # Força o retorno falso já que estamos em produção

def server_is_sandbox():
    return False # Desativa completamente o modo Sandbox/Ambiente de testes

def _resolve_back_urls(return_base):
    """Mercado Pago exige back_urls HTTPS públicas para auto_return."""
    base = (return_base or "").rstrip("/")
    is_local = (
        not base
        or base.startswith("http://localhost")
        or base.startswith("http://127.0.0.1")
    )
    if is_local:
        base = BACK_URL_SUCCESS.rsplit("/success", 1)[0].rstrip("/")

    back_urls = {
        "success": f"{base}/success/",
        "failure": f"{base}/failure/",
        "pending": f"{base}/pending/",
    }
    use_auto_return = base.startswith("https://")
    return back_urls, use_auto_return


def _mp_get(path):
    headers = {'Authorization': f'Bearer {MP_ACCESS_TOKEN}'}
    url = f'https://api.mercadopago.com{path}'
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()

# ===== VIEWS =====

class CreatePreferenceView(APIView):
    """
    Cria preferência (Checkout Pro) ou pagamento one-shot (automatic) se receber card_token.
    Valida mismatch entre client_public_key (opcional) e ambiente do servidor.
    """
    def post(self, request):
        try:
            payload = request.data
            order_id = payload.get("orderId")
            if not order_id:
                return Response({'error': 'orderId is required'}, status=400)

            order = get_object_or_404(Order, id=order_id)

            # validação de ambiente (opcional: front envia client_public_key)
            client_key = payload.get('client_public_key')
            if client_key:
                client_is_test = is_test_key(client_key)
                if client_is_test != server_is_sandbox():
                    return Response({
                        'error': 'Ambiente inconsistente entre front e backend. Ajuste para TEST-... ou APP_USR-...'
                    }, status=400)

            # fluxo one-shot (automatic) com token do cartão
            card_token = payload.get('card_token')
            processing_mode = payload.get('processing_mode', 'preference')

            if card_token and processing_mode == 'automatic':
                mp_payload = {
                    "type": "online",
                    "processing_mode": "automatic",
                    "external_reference": str(order.id),
                    "total_amount": str(order.price),
                    "payer": {"email": payload.get('buyer_email', order.buyer_email or '')},
                    "transactions": {
                        "payments": [
                            {
                                "amount": str(order.price),
                                "payment_method": {
                                    "id": payload.get('card_brand', 'visa'),
                                    "type": "credit_card",
                                    "token": card_token,
                                    "installments": int(payload.get('installments', 1))
                                }
                            }
                        ]
                    }
                }
                headers = {'Authorization': f'Bearer {MP_ACCESS_TOKEN}', 'Content-Type': 'application/json'}
                resp = requests.post('https://api.mercadopago.com/checkout/orders', headers=headers, json=mp_payload, timeout=15)
                if resp.status_code not in (200,201):
                    return Response({'error': 'MP create order failed', 'detail': resp.text}, status=resp.status_code)
                payment_resp = resp.json()
                order.payment_status = payment_resp.get('status') or payment_resp.get('payments', [{}])[0].get('status')
                order.payment_id = payment_resp.get('id') or payment_resp.get('payments', [{}])[0].get('id')
                order.raw_response = payment_resp
                order.processed = (order.payment_status == 'approved')
                order.save()
                
                return Response({'ok': True, 'payment': payment_resp}, status=201)

            return_base = payload.get("return_base_url")
            back_urls, use_auto_return = _resolve_back_urls(return_base)

            preference_data = {
                "items": [
                    {"title": f"Pacote {order.package}", "quantity": 1, "unit_price": float(order.price), "description": f"Pacote {order.package}"}
                ],
                "external_reference": str(order.id),
                "notification_url": MP_NOTIFICATION_URL,
                "back_urls": back_urls,
                "payer": {"email": payload.get('buyer_email', order.buyer_email or '')}
            }
            if use_auto_return:
                preference_data["auto_return"] = "approved"

            print("Criando preferência com:", json.dumps(preference_data))
            preference_response = sdk.preference().create(preference_data)
            print("Resposta do SDK:", preference_response)

            if preference_response.get("status") != 201:
                err = preference_response.get("response", {})
                msg = err.get("message") if isinstance(err, dict) else str(err)
                return Response({'error': 'Erro ao criar preferência', 'detail': msg}, status=400)

            if not preference_response or "response" not in preference_response:
                return Response({'error': 'Erro ao criar preferência', 'detail': preference_response}, status=500)

            pref = preference_response["response"]
            if not pref.get("init_point"):
                return Response({'error': 'Erro ao criar preferência', 'detail': 'init_point ausente na resposta do Mercado Pago'}, status=400)

            order.raw_response = pref
            order.save()

            return Response({
                'id': pref.get('id'),
                'init_point': pref.get('init_point'),
                'sandbox_init_point': pref.get('sandbox_init_point'),
                'external_reference': pref.get('external_reference'),
                'raw': pref
            }, status=201)

        except Exception as e:
            print("Exception CreatePreferenceView:", str(e))
            return Response({'error': str(e)}, status=500)


@csrf_exempt
def CreateOrder(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Método não permitido'}, status=405)
    try:
        data = json.loads(request.body.decode('utf-8'))
        order = Order.objects.create(
            package=data.get('package'),
            price=data.get('price'),
            buyer_name=data.get('buyer_name'),
            buyer_email=data.get('buyer_email'),
            payment_method=data.get('payment_method'),
            link=data.get('link'),
        )
        return JsonResponse({'message': 'Pedido salvo com sucesso', 'orderId': order.id}, status=201)
    except Exception as e:
        return JsonResponse({'message': f'Erro ao salvar pedido: {str(e)}'}, status=500)


@csrf_exempt
def emitir_ordem_api_five(request, order_id):
    if request.method not in ['POST', 'GET']:
        return JsonResponse({"error": "Método não permitido"}, status=405)
    try:
        order_response = dispatch_order_to_api_five(order_id, api)
        return JsonResponse(order_response, status=201)
    except Order.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=404)
    except Exception as e:
        print(f"Erro emitir_ordem_api_five order={order_id}: {e}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def payment_webhook(request):
    """
    Webhook Mercado Pago (GET IPN ou POST JSON):
    - GET: ?topic=payment&id=123
    - POST: {"type":"payment","data":{"id":"123"}}
    """
    if request.method not in ("GET", "POST"):
        return JsonResponse({"status": "invalid method"}, status=405)
    try:
        topic, payment_id, merchant_order_id_from_webhook, body = _parse_webhook_request(request)
        print("Webhook recebido:", {"method": request.method, "topic": topic, "payment_id": payment_id, "body": body})

        if not payment_id and not merchant_order_id_from_webhook:
            print("Webhook sem payment id, ignorando:", body)
            return JsonResponse({"status": "ignored", "reason": "no payment id"}, status=200)

        payment_info = None
        merchant_order = None

        if payment_id:
            payment = sdk.payment().get(payment_id)
            payment_info = payment.get('response', {})
            status_mp = payment_info.get('status') or payment_info.get('collection_status')
            external_ref = payment_info.get('external_reference')
            merchant_order_id = (payment_info.get('order') or {}).get('id') or payment_info.get('merchant_order_id')
        else:
            merchant_order_id = merchant_order_id_from_webhook
            external_ref = None
            status_mp = None

        if merchant_order_id:
            try:
                merchant_order = _mp_get(f'/merchant_orders/{merchant_order_id}')
                mo_id = body.get('data', {}).get('id') or body.get('id')
                
                # Se você já tem essa função atualizando o pedido, ela pode conflitar. 
                # Mantenha se for estritamente necessário.
                if mo_id:
                    resultado = process_merchant_order_and_update_order(mo_id)
                    print('Resultado processamento merchant_order:', resultado)

                if not external_ref:
                    external_ref = merchant_order.get('external_reference')
                if not status_mp:
                    # Mapeamento do status da merchant_order (pode vir como 'closed' quando pago)
                    mo_status = merchant_order.get('status')
                    if mo_status == "closed":
                        status_mp = "approved"
                    else:
                        status_mp = mo_status
            except Exception as e:
                print('Erro ao buscar merchant_order:', e)
                merchant_order = None

        if not external_ref:
            print("Pagamento/merchant_order sem external_reference, ignorando para evitar reenvios")
            return JsonResponse({"status": "ignored", "reason": "no external_reference"}, status=200)

        # 1. Localizar order local
        try:
            order_pk = int(external_ref)
        except Exception:
            order_pk = external_ref

        try:
            order = Order.objects.get(id=order_pk)
        except Order.DoesNotExist:
            print("Order não encontrada para external_reference:", external_ref)
            return JsonResponse({"status": "ignored", "reason": "order not found"}, status=200)

        # 2. SE O PEDIDO JÁ FOI PAGO E PROCESSADO, IGNORE
        if order.processed and order.payment_status == 'paid':
            print(f"Pedido {order.id} já foi pago e processado anteriormente.")
            return JsonResponse({"status": "already_processed"}, status=200)

        # Criamos uma flag para disparar a API externa APÓS salvar no banco
        deve_emitir_ordem = False

        # 3. ATUALIZA O STATUS BASEADO NO RETORNO DO MERCADO PAGO
        if status_mp == "approved":
            order.payment_status = 'paid'
            order.processed = True  
            deve_emitir_ordem = True # Ativa a flag para envio posterior
            print(f"Pedido {order.id} MARCADO COMO APROVADO no bloco lógico.")

        elif status_mp in ["rejected", "cancelled", "refunded", "charged_back"]:
            order.payment_status = 'failed'
            order.processed = True
            print(f"Pedido {order.id} falhou ou foi cancelado. Status MP: {status_mp}")
        
        else:
            order.payment_status = 'pending'

        # 4. Salva as alterações e a resposta bruta no banco de dados PRIMEIRO
        if payment_id:
            order.payment_id = payment_id
        order.raw_response = payment_info or merchant_order
        order.updated_at = timezone.now()
        
        # O banco de dados salva aqui de forma garantida
        order.save()
        print(f"Banco de dados atualizado com sucesso para o pedido {order.id}. Status: {order.payment_status}")

        # 5. CHAMADA PROTEGIDA PARA A API FIVE
                # 5. CHAMADA PROTEGIDA PARA A API FIVE
        if deve_emitir_ordem:
            print(f"Iniciando envio para API Five do pedido {order.id}...")
            try:
                dispatch_order_to_api_five(order.id, api)
                print(f"Sucesso ao enviar para API Five do pedido {order.id}.")
                return JsonResponse({
                    "status": "success",
                    "new_status": order.payment_status,
                    "detail": "Pedido pago e enviado para API Five com sucesso",
                }, status=200)
            except Exception as error_api:
                print(f"[ERRO CRÍTICO] Falha ao enviar para API Five: {error_api}")
                return JsonResponse({
                    "status": "paid_but_api_five_failed",
                    "detail": f"Pedido pago no banco, mas falhou ao enviar para API Five: {error_api}",
                }, status=200)

        return JsonResponse({"status": "success", "new_status": order.payment_status}, status=200)

    except Exception as e:
        print(f"Erro geral no webhook: {str(e)}")
        return JsonResponse({"status": "error", "detail": str(e)}, status=500)

@csrf_exempt
def verify_payment(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
        payment_id = payload.get('paymentId') or payload.get('collection_id')
        if not payment_id:
            return JsonResponse({'error': 'paymentId required'}, status=400)

        payment = sdk.payment().get(payment_id)
        payment_info = payment.get('response', {})
        external_ref = payment_info.get('external_reference')
        status_mp = payment_info.get('status') or payment_info.get('collection_status')

        if not external_ref:
            return JsonResponse({'error': 'external_reference missing in payment'}, status=400)

        order = get_object_or_404(Order, id=int(external_ref))
        already_fulfilled = order.payment_status == 'paid' and order.processed
        order.payment_id = str(payment_info.get('id') or payment_id)
        status_mp = payment_info.get('status') or payment_info.get('collection_status')
        order.payment_status = 'paid' if status_mp == 'approved' else status_mp
        order.processed = (status_mp == 'approved')
        order.raw_response = payment_info
        order.updated_at = timezone.now()
        order.save()

        api_five = None
        api_five_error = None
        if status_mp == 'approved' and not already_fulfilled:
            try:
                api_five = dispatch_order_to_api_five(order.id, api)
            except Exception as e:
                api_five_error = str(e)
                print(f"verify_payment: falha API Five order={order.id}: {e}")

        return JsonResponse({
            'ok': True,
            'orderId': order.id,
            'status': order.payment_status,
            'api_five': api_five,
            'api_five_error': api_five_error,
        }, status=200)
    except Exception as e:
        print("Erro verify_payment:", e)
        return JsonResponse({'error': 'internal error', 'detail': str(e)}, status=500)


# Páginas simples
def success(request):
    return render(request, 'success.html')
def failure(request):
    return render(request, 'failure.html')
def pending(request):
    return render(request, 'pending.html')
def home(request):
    return render(request, 'index.html')
