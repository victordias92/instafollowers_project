from .models import Order
from .packages import PACKAGE_SERVICE_MAP, PACKAGE_QUANTITY_MAP


def dispatch_order_to_api_five(order_id, api_client):
    order = Order.objects.get(id=order_id)
    link = (order.link or "").strip()
    if not link:
        raise ValueError("Link do Instagram ausente no pedido")

    service_id = PACKAGE_SERVICE_MAP.get(order.package)
    if not service_id:
        raise ValueError(f"Pacote não mapeado para API Five: {order.package}")

    quantity = PACKAGE_QUANTITY_MAP.get(service_id, 1)
    print(
        f"Emitindo ordem API Five: order={order_id}, "
        f"package={order.package}, qty={quantity}, link={link}"
    )

    order_response = api_client.order({
        "service": 13228,
        "link": link,
        "quantity": quantity,
    })

    if not order_response:
        raise RuntimeError("API Five não retornou resposta")
    if order_response.get("error"):
        raise RuntimeError(f"API Five erro: {order_response['error']}")

    return order_response
