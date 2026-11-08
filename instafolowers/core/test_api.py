import requests

resp = requests.post("https://app.fivebbc.com/api/v2", data={
    "key": "c3e410cd9504ac83fb68c21b79a9c814",
    "action": "services"
})
print(resp.json())
