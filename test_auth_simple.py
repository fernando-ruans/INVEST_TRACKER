import requests
import json

# Configurações
base_url = "http://127.0.0.1:8000/api/auth"
headers = {"Content-Type": "application/json"}

# Dados do usuário de teste
test_user = {
    "username": "newuser",
    "email": "newuser@test.com",
    "password": "NewUser123",
    "full_name": "New User"
}

print("=== Teste de Autenticação ===")

# 1. Tentar registrar um novo usuário
print("\n1. Registrando novo usuário...")
try:
    reg_response = requests.post(f"{base_url}/register", headers=headers, json=test_user)
    print(f"Status do registro: {reg_response.status_code}")
    
    if reg_response.status_code == 201:
        print("✓ Usuário registrado com sucesso!")
        print(f"Resposta: {reg_response.json()}")
    elif reg_response.status_code == 400:
        print("⚠ Usuário já existe (isso é normal)")
        print(f"Resposta: {reg_response.text}")
    else:
        print(f"✗ Erro no registro: {reg_response.text}")
except Exception as e:
    print(f"Erro na requisição de registro: {e}")

# 2. Tentar fazer login
print("\n2. Tentando fazer login...")
login_data = {
    "username": test_user["username"],
    "password": test_user["password"]
}

try:
    login_response = requests.post(f"{base_url}/login", headers=headers, json=login_data)
    print(f"Status do login: {login_response.status_code}")
    
    if login_response.status_code == 200:
        print("✓ Login realizado com sucesso!")
        token_data = login_response.json()
        print(f"Token recebido: {token_data['access_token'][:50]}...")
        
        # 3. Testar acesso a endpoint protegido
        print("\n3. Testando acesso a endpoint protegido...")
        auth_headers = {
            "Authorization": f"Bearer {token_data['access_token']}",
            "Content-Type": "application/json"
        }
        
        me_response = requests.get(f"{base_url}/me", headers=auth_headers)
        print(f"Status do /me: {me_response.status_code}")
        
        if me_response.status_code == 200:
            print("✓ Acesso autorizado!")
            print(f"Dados do usuário: {me_response.json()}")
        else:
            print(f"✗ Acesso negado: {me_response.text}")
    else:
        print(f"✗ Falha no login: {login_response.text}")
except Exception as e:
    print(f"Erro na requisição de login: {e}")

print("\n=== Fim do teste ===")