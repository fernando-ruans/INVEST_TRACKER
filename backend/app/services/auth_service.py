from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
import secrets
import string

from app.database.database import SessionLocal, User, UserVerification, PasswordReset
from app.models.auth_schemas import TokenData

# Configurações de segurança
SECRET_KEY = os.getenv("SECRET_KEY", "insecure_key_for_dev_only_please_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuração do contexto de criptografia para senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuração do OAuth2 para autenticação via token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Função para obter uma sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Funções de autenticação e segurança
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        if username is None or user_id is None:
            raise credentials_exception
        token_data = TokenData(username=username, user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return current_user

# Funções para verificação de email e redefinição de senha
def generate_verification_code():
    # Gera um código alfanumérico de 8 caracteres
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(8))

def create_verification_code(db: Session, user_id: int):
    # Cria um código de verificação válido por 24 horas
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(days=1)
    
    # Verifica se já existe um código para este usuário e o atualiza
    existing_verification = db.query(UserVerification).filter(UserVerification.user_id == user_id).first()
    if existing_verification:
        existing_verification.verification_code = code
        existing_verification.expires_at = expires_at
        existing_verification.verified_at = None
        db.commit()
        return existing_verification
    
    # Caso contrário, cria um novo registro
    verification = UserVerification(
        user_id=user_id,
        verification_code=code,
        expires_at=expires_at
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)
    return verification

def verify_user_email(db: Session, verification_code: str):
    # Verifica o código e marca o usuário como verificado
    verification = db.query(UserVerification).filter(
        UserVerification.verification_code == verification_code,
        UserVerification.expires_at > datetime.utcnow(),
        UserVerification.verified_at.is_(None)
    ).first()
    
    if not verification:
        return False
    
    # Marca o código como usado
    verification.verified_at = datetime.utcnow()
    
    # Marca o usuário como verificado
    user = get_user_by_id(db, verification.user_id)
    user.is_verified = True
    
    db.commit()
    return True

def create_password_reset(db: Session, user_id: int):
    # Cria um código de redefinição de senha válido por 1 hora
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Verifica se já existe um código para este usuário e o atualiza
    existing_reset = db.query(PasswordReset).filter(
        PasswordReset.user_id == user_id,
        PasswordReset.used_at.is_(None)
    ).first()
    
    if existing_reset:
        existing_reset.reset_code = code
        existing_reset.expires_at = expires_at
        db.commit()
        return existing_reset
    
    # Caso contrário, cria um novo registro
    reset = PasswordReset(
        user_id=user_id,
        reset_code=code,
        expires_at=expires_at
    )
    db.add(reset)
    db.commit()
    db.refresh(reset)
    return reset

def verify_password_reset(db: Session, reset_code: str, new_password: str):
    # Verifica o código e redefine a senha
    reset = db.query(PasswordReset).filter(
        PasswordReset.reset_code == reset_code,
        PasswordReset.expires_at > datetime.utcnow(),
        PasswordReset.used_at.is_(None)
    ).first()
    
    if not reset:
        return False
    
    # Marca o código como usado
    reset.used_at = datetime.utcnow()
    
    # Atualiza a senha do usuário
    user = get_user_by_id(db, reset.user_id)
    user.hashed_password = get_password_hash(new_password)
    
    db.commit()
    return True