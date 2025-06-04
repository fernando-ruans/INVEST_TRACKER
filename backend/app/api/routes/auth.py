from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import os
import uuid
from pathlib import Path

from app.database.database import User
from app.models.auth_schemas import (
    UserCreate, UserResponse, UserUpdate, UserUpdatePassword,
    Token, LoginRequest, PasswordResetRequest, PasswordResetConfirm,
    VerificationRequest
)
from app.services.auth_service import (
    get_db, get_user, get_user_by_email, get_password_hash, authenticate_user,
    create_access_token, get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES,
    verify_password, create_verification_code, verify_user_email,
    create_password_reset, verify_password_reset
)

router = APIRouter()

# Endpoint para registro de usuário
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Verificar se o usuário já existe
    db_user_by_email = get_user_by_email(db, email=user.email)
    if db_user_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado"
        )
    
    db_user_by_username = get_user(db, username=user.username)
    if db_user_by_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já registrado"
        )
    
    # Criar novo usuário
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_verified=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Criar código de verificação e enviar email (simulado)
    verification = create_verification_code(db, db_user.id)
    # TODO: Implementar envio de email com o código de verificação
    # background_tasks.add_task(send_verification_email, db_user.email, verification.verification_code)
    
    return db_user

# Endpoint para login
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "id": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint para login usando o formulário OAuth2 padrão
@router.post("/token", response_model=Token)
async def login_with_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nome de usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "id": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint para verificar email
@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(verification_data: VerificationRequest, db: Session = Depends(get_db)):
    if not verify_user_email(db, verification_data.verification_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificação inválido ou expirado"
        )
    
    return {"message": "Email verificado com sucesso"}

# Endpoint para solicitar redefinição de senha
@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(reset_request: PasswordResetRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = get_user_by_email(db, reset_request.email)
    if not user:
        # Não revelamos se o email existe ou não por segurança
        return {"message": "Se o email estiver registrado, você receberá um link para redefinir sua senha"}
    
    reset = create_password_reset(db, user.id)
    # TODO: Implementar envio de email com o código de redefinição
    # background_tasks.add_task(send_password_reset_email, user.email, reset.reset_code)
    
    return {"message": "Se o email estiver registrado, você receberá um link para redefinir sua senha"}

# Endpoint para redefinir senha
@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(reset_data: PasswordResetConfirm, db: Session = Depends(get_db)):
    if not verify_password_reset(db, reset_data.reset_code, reset_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de redefinição inválido ou expirado"
        )
    
    return {"message": "Senha redefinida com sucesso"}

# Endpoint para obter dados do usuário atual
@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Endpoint para atualizar dados do usuário
@router.put("/me", response_model=UserResponse)
async def update_user(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Verificar se o email já está em uso por outro usuário
    if user_update.email and user_update.email != current_user.email:
        db_user = get_user_by_email(db, user_update.email)
        if db_user and db_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso"
            )
    
    # Verificar se o username já está em uso por outro usuário
    if user_update.username and user_update.username != current_user.username:
        db_user = get_user(db, user_update.username)
        if db_user and db_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nome de usuário já está em uso"
            )
    
    # Atualizar os campos fornecidos
    if user_update.email:
        current_user.email = user_update.email
    if user_update.username:
        current_user.username = user_update.username
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

# Endpoint para alterar senha
@router.put("/me/password", status_code=status.HTTP_200_OK)
async def update_password(password_update: UserUpdatePassword, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Verificar senha atual
    if not verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    # Atualizar senha
    current_user.hashed_password = get_password_hash(password_update.new_password)
    db.commit()
    
    return {"message": "Senha atualizada com sucesso"}

# Endpoint para upload de avatar
@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(avatar: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Verificar se o arquivo é uma imagem
    if not avatar.content_type or not avatar.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo deve ser uma imagem"
        )
    
    # Verificar tamanho do arquivo (máximo 5MB)
    if avatar.size and avatar.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo muito grande. Máximo 5MB"
        )
    
    try:
        # Criar diretório de uploads se não existir
        upload_dir = Path("uploads/avatars")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Gerar nome único para o arquivo
        file_extension = Path(avatar.filename or "").suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Salvar arquivo
        with open(file_path, "wb") as buffer:
            content = await avatar.read()
            buffer.write(content)
        
        # Remover avatar anterior se existir
        if current_user.avatar:
            old_file_path = Path(current_user.avatar)
            if old_file_path.exists():
                old_file_path.unlink()
        
        # Atualizar usuário com novo avatar
        current_user.avatar = str(file_path)
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload do avatar: {str(e)}"
        )

# Endpoint para remover avatar
@router.delete("/me/avatar", response_model=UserResponse)
async def remove_avatar(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    try:
        # Remover arquivo do avatar se existir
        if current_user.avatar:
            file_path = Path(current_user.avatar)
            if file_path.exists():
                file_path.unlink()
        
        # Remover avatar do usuário
        current_user.avatar = None
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao remover avatar: {str(e)}"
        )