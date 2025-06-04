import sys
sys.path.append('.')

from app.database.database import get_db, User
from app.services.auth_service import verify_password

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
    print(f"Hashed Password: {user.hashed_password[:50]}...")
    
    # Testar senhas comuns para este usuário
    test_passwords = ['admin', 'admin123', '12345678', 'password', 'Password123', 'Admin123', 'Test123!']
    print("\nTestando senhas:")
    for pwd in test_passwords:
        is_valid = verify_password(pwd, user.hashed_password)
        if is_valid:
            print(f"  ✓ SENHA CORRETA: '{pwd}'")
        else:
            print(f"  ✗ Senha incorreta: '{pwd}'")
    print("-" * 50)

db.close()