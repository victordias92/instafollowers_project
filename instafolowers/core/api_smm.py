import requests
from typing import List, Union

class Api:
    def __init__(self, api_key: str, api_url: str = "https://smmja.com/api/v2"):
        self.api_url = api_url
        self.api_key = api_key

    def _connect(self, payload: dict) -> dict:
        payload["key"] = self.api_key
        response = requests.post(self.api_url, data=payload)
        response.raise_for_status()
        return response.json()

    # Add order
    def order(self, data: dict) -> dict:
        return self._connect({"action": "add", **data})

    # Get order status
    def status(self, order_id: int) -> dict:
        return self._connect({"action": "status", "order": order_id})

    # Get multiple orders status
    def multi_status(self, order_ids: List[int]) -> dict:
        return self._connect({"action": "status", "orders": ",".join(map(str, order_ids))})

    # Get services
    def services(self) -> dict:
        return self._connect({"action": "services"})

    # Refill order
    def refill(self, order_id: int) -> dict:
        return self._connect({"action": "refill", "order": order_id})

    # Refill multiple orders
    def multi_refill(self, order_ids: List[int]) -> dict:
        return self._connect({"action": "refill", "orders": ",".join(map(str, order_ids))})

    # Get refill status
    def refill_status(self, refill_id: int) -> dict:
        return self._connect({"action": "refill_status", "refill": refill_id})

    # Get multiple refill statuses
    def multi_refill_status(self, refill_ids: List[int]) -> dict:
        return self._connect({"action": "refill_status", "refills": ",".join(map(str, refill_ids))})

    # Cancel orders
    def cancel(self, order_ids: List[int]) -> dict:
        return self._connect({"action": "cancel", "orders": ",".join(map(str, order_ids))})

    # Get balance
    def balance(self) -> dict:
        return self._connect({"action": "balance"})
