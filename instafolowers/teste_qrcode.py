import requests
import uuid

ACCESS_TOKEN = "APP_USR-2176340421959969-051217-30b9e84a841d1ba3292728b462db3528-3396410395"  # seu token de produção ou sandbox

url = "https://api.mercadopago.com/v1/orders"

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
    "X-Idempotency-Key": str(uuid.uuid4())  # gera chave única por requisição
}

payload = {
    "type": "qr",
    "total_amount": "50.00",
    "description": "Smartphone",
    "external_reference": "your_external_reference",
    "expiration_time": "PT16M",
    "integration_data": {
        "platform_id": "dev_1234567890",
        "integrator_id": "dev_1234"
    },
    "config": {
        "qr": {
            "external_pos_id": "3396410399",
            "mode": "static"
        }
    },
    "transactions": {
        "payments": [
            {
                "amount": "50.00"
            }
        ]
    },
    "items": [
        {
            "title": "Smartphone",
            "unit_price": "50.00",
            "quantity": 1,
            "unit_measure": "kg",
            "external_code": "777489134"
        }
    ],
    "discounts": {
        "payment_methods": [
            {
                "new_total_amount": "47.28",
                "type": "account_money"
            }
        ]
    }
}

response = requests.post(url, headers=headers, json=payload)
print(response.status_code)
print(response.json())
