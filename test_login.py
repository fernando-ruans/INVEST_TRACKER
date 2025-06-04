import requests
import json

# Testar o endpoint de login
url = "http://127.0.0.1:8000/api/auth/login"
headers = {"Content-Type": "application/json"}
data = {
    "username": "admin",
    "password": "admin"
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Login bem-sucedido!")
    else:
        print("Falha no login")
        
except Exception as e:
    print(f"Erro na requisição: {e}")