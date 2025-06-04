import requests
import json

# Testar login via API
print("\n=== Testando login via API ===")
url = "http://127.0.0.1:8000/api/auth/login"
headers = {"Content-Type": "application/json"}

test_credentials = [
    {"username": "admin", "password": "admin123"},
    {"username": "admin", "password": "admin"},
    {"username": "admin", "password": "12345678"},
    {"username": "admin", "password": "password"},
    {"username": "admin", "password": "Password123"},
    {"username": "admin", "password": "Admin123"},
    {"username": "admin", "password": "Admin@123"},
    {"username": "admin", "password": "Admin123!"}
]

for cred in test_credentials:
    try:
        response = requests.post(url, headers=headers, json=cred)
        print(f"Login {cred['username']}/{cred['password']}: Status {response.status_code}")
        if response.status_code == 200:
            print(f"✓ SUCESSO: {response.json()}")
        else:
            print(f"✗ ERRO: {response.text}")
    except Exception as e:
        print(f"Erro na requisição: {e}")
    print("---")

# Tentar registrar um novo usuário
print("\n=== Tentando registrar um novo usuário ===")
reg_url = "http://127.0.0.1:8000/api/auth/register"

new_user = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
}

try:
    response = requests.post(reg_url, headers=headers, json=new_user)
    print(f"Registro: Status {response.status_code}")
    if response.status_code == 201:
        print(f"✓ SUCESSO: {response.json()}")
    else:
        print(f"✗ ERRO: {response.text}")
        
    # Se o registro foi bem-sucedido, tente fazer login
    if response.status_code == 201:
        login_response = requests.post(url, headers=headers, json={
            "username": new_user["username"],
            "password": new_user["password"]
        })
        print(f"\nLogin com novo usuário: Status {login_response.status_code}")
        if login_response.status_code == 200:
            print(f"✓ SUCESSO: {login_response.json()}")
        else:
            print(f"✗ ERRO: {login_response.text}")
            
except Exception as e:
    print(f"Erro na requisição: {e}")