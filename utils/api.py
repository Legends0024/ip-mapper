import requests

def get_location(ip):
    try:
        url = f"http://ip-api.com/json/{ip}"
        response = requests.get(url)
        return response.json()
    except:
        return {"status": "fail"}