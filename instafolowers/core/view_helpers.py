# views_helpers.py (ou cole no seu views.py)
import os
import requests
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings

from .models import Order

MP_ACCESS_TOKEN = os.getenv('MP_ACCESS_TOKEN') or getattr(settings, 'MP_ACCESS_TOKEN', None)
MP_API_BASE = 'https://api.mercadopago.com'

HEADERS = {'Authorization': f'Bearer {MP_ACCESS_TOKEN}'}

def _get_merchant_order(mo_id):
    url = f'{MP_API_BASE}/merchant_orders/{mo_id}'
    resp = requests.get(url, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return resp.json()

def _get_payment(payment_id):
    url = f'{MP_API_BASE}/v1/payments/{payment_id}'
    resp = requests.get(url, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return resp.json()

def process_merchant_order_and_update_order(mo_id):
    """
    Busca merchant_order, extrai payments[] e tenta localizar external_reference.
    Atualiza a Order local quando encontra external_reference correspondente.
    Retorna um dict com o resultado para logging.
    """
    result = {'merchant_order_id': mo_id, 'found_payments': [], 'updated_orders': [], 'notes': []}
    try:
        mo = _get_merchant_order(mo_id)
    except requests.HTTPError as e:
        result['notes'].append(f'Erro ao buscar merchant_order: {str(e)}')
        return result
    except Exception as e:
        result['notes'].append(f'Erro inesperado ao buscar merchant_order: {str(e)}')
        return result

    payments = mo.get('payments', []) or []
    result['found_payments'] = [{'id': p.get('id'), 'status': p.get('status')} for p in payments]

    if not payments:
        result['notes'].append('Nenhum pagamento associado ainda ao merchant_order (payments[] vazio).')
        return result

    # Itera pagamentos para encontrar external_reference e atualizar Order local
    for p in payments:
        pid = p.get('id')
        if not pid:
            continue
        try:
            payment_resp = _get_payment(pid)
        except requests.HTTPError as e:
            result['notes'].append(f'Erro ao buscar payment {pid}: {str(e)}')
            continue
        except Exception as e:
            result['notes'].append(f'Erro inesperado ao buscar payment {pid}: {str(e)}')
            continue

        payment_info = payment_resp or {}
        external_ref = payment_info.get('external_reference') or payment_info.get('order', {}).get('external_reference')
        status_mp = payment_info.get('status') or payment_info.get('collection_status') or p.get('status')

        result['found_payments'].append({'id': pid, 'external_reference': external_ref, 'status': status_mp})

        if not external_ref:
            # não conseguimos mapear para uma order local a partir deste payment
            result['notes'].append(f'Payment {pid} sem external_reference; ignorando para mapeamento.')
            continue

        # Tenta converter external_reference para inteiro (se você usa id numérico)
        try:
            order_pk = int(external_ref)
        except Exception:
            order_pk = external_ref

        try:
            order = get_object_or_404(Order, id=order_pk)
        except Exception:
            result['notes'].append(f'Nenhuma Order local encontrada para external_reference={external_ref}')
            continue

        # Idempotência: se já processado com mesmo payment_id, apenas atualiza status e raw_response
        if order.payment_id and str(order.payment_id) == str(pid):
            order.payment_status = status_mp
            order.raw_response = payment_info
            order.updated_at = timezone.now()
            order.save(update_fields=['payment_status', 'raw_response', 'updated_at'])
            result['updated_orders'].append({'order_id': order.id, 'payment_id': pid, 'action': 'status_updated'})
            continue

        # Atualiza order com dados do pagamento
        order.payment_id = str(pid)
        order.merchant_order_id = mo_id
        order.payment_status = status_mp
        order.raw_response = payment_info
        order.processed = (status_mp == 'approved')
        order.updated_at = timezone.now()
        order.save()
        result['updated_orders'].append({'order_id': order.id, 'payment_id': pid, 'status': status_mp})

        # Se aprovado, você pode disparar a emissão do serviço aqui (sincrona ou enfileirada)
        if status_mp == 'approved':
            try:
                from .fulfillment import dispatch_order_to_api_five
                from .api_five import Api
                api_client = Api(api_key=os.getenv('API_FIVE_KEY'))
                dispatch_order_to_api_five(int(order.id), api_client)
                result['notes'].append(f'emitir_ordem_api_five chamada para order {order.id}')
            except Exception as e:
                result['notes'].append(f'Erro ao chamar emitir_ordem_api_five para order {order.id}: {str(e)}')

    return result
