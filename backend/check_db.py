import sys
sys.path.append('.')

from app.database.database import get_db, User
from app.services.auth_service import verify_password, get_password_hash

# Verificar usuários no banco
print("=== Verificando usuários no banco PostgreSQL ===")
db = next(get_db())
users = db.query(User).all()
print(f"Total de usuários: {len(users)}")

for user in users:
    print(f"\nID: {user.id}")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Full Name: {user.full_name}")
    print(f"Active: {user.is_active}")
    print(f"Verified: {user.is_verified}")
    print(f"Created: {user.created_at}")
    print(f"Hashed Password: {user.hashed_password}")
    
    # Testar senhas comuns para este usuário
    test_passwords = ['Test123!', 'Test123', 'admin123', '12345678', 'password']
    print("\nTestando senhas:")
    for pwd in test_passwords:
        try:
            is_valid = verify_password(pwd, user.hashed_password)
            if is_valid:
                print(f"  ✓ SENHA CORRETA: '{pwd}'")
            else:
                print(f"  ✗ Senha incorreta: '{pwd}'")
        except Exception as e:
            print(f"  ⚠ Erro ao verificar senha '{pwd}': {e}")
    
    # Testar criação de nova senha hash
    print("\nTestando criação de hash:")
    try:
        new_hash = get_password_hash('Test123!')
        print(f"  Novo hash criado: {new_hash[:50]}...")
        is_valid = verify_password('Test123!', new_hash)
        print(f"  Verificação do novo hash: {'✓ OK' if is_valid else '✗ FALHOU'}")
    except Exception as e:
        print(f"  ⚠ Erro ao criar/verificar hash: {e}")
    
    print("-" * 50)

db.close()