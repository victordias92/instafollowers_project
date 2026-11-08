import requests
import json
import os

api_key = os.getenv("API_FIVE_KEY") # Certifique-se de que esta variável de ambiente esteja definida corretamente


class Api:
    def __init__(self, api_key, api_url="https://app.fivebbc.com/api/v2"):
        self.api_url = api_url
        self.api_key = api_key

    def _connect(self, data):
        post = {"key": self.api_key}
        post.update(data)
        try:
            response = requests.post(self.api_url, data=post, headers={
                "User-Agent": "Mozilla/5.0"
            }, verify=False)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Erro na requisição: {e}")
            return None

    def order(self, data):
        return self._connect({"action": "add", **data})

    def status(self, order_id):
        return self._connect({"action": "status", "order": order_id})

    def multi_status(self, order_ids):
        return self._connect({"action": "status", "orders": ",".join(map(str, order_ids))})

    def services(self):
        return self._connect({"action": "services"})

    def refill(self, order_id):
        return self._connect({"action": "refill", "order": order_id})

    def multi_refill(self, order_ids):
        return self._connect({"action": "refill", "orders": ",".join(map(str, order_ids))})

    def refill_status(self, refill_id):
        return self._connect({"action": "refill_status", "refill": refill_id})

    def multi_refill_status(self, refill_ids):
        return self._connect({"action": "refill_status", "refills": ",".join(map(str, refill_ids))})

    def cancel(self, order_ids):
        return self._connect({"action": "cancel", "orders": ",".join(map(str, order_ids))})

    def balance(self):
        return self._connect({"action": "balance"})


# Exemplos de uso
if __name__ == "__main__":
    api = Api(api_key="914cdc69797ed92226ebd6cf1ee05bdc")

    # Listar serviços
    services = api.services()
    print("Serviços disponíveis:", services)

    # Ver saldo
    balance = api.balance()
    print("Saldo:", balance)

    # Criar pedido
    order = api.order({
        "service": 13228,
        "link": "https://www.instagram.com/victordias.code/",
        "quantity": 50
    })
    print("Novo pedido:", order)

    # Status do pedido
    if order and "order" in order:
        status = api.status(order["order"])
        print("Status do pedido:", status)
