import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Upload, X, Camera, Edit3, Save, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarUrlWithTimestamp, createFilePreview } from '../utils/imageUtils';
import AvatarImage from './AvatarImage';

const ProfilePage: React.FC = () => {
  const { user, updateUser, updatePassword, logout, uploadAvatar, removeAvatar } = useAuth();
  const navigate = useNavigate();

  // Estado para o formulário de perfil
  const [profileForm, setProfileForm] = useState({
    email: user?.email || '',
    username: user?.username || '',
    fullName: user?.fullName || ''
  });

  // Estado para o avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualizar o formulário quando o usuário mudar
  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || '',
        username: user.username || '',
        fullName: user.fullName || ''
      });
      setAvatarPreview(getAvatarUrlWithTimestamp(user.avatar));
    }
  }, [user]);

  // Estado para o formulário de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para controle de UI
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Manipuladores de formulário
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (profileError) setProfileError('');
    if (profileSuccess) setProfileSuccess('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  // Manipulador para seleção de arquivo de avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      try {
        const preview = await createFilePreview(file);
        setAvatarPreview(preview);
      } catch (error) {
        console.error('Erro ao criar preview do avatar:', error);
      }
    }
  };

  // Manipulador para remover avatar
  const handleRemoveAvatar = async () => {
    try {
      setIsProfileLoading(true);
      await removeAvatar();
      setAvatarPreview(null);
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfileSuccess('Avatar removido com sucesso');
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao remover avatar');
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Manipulador para upload de avatar
  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    try {
      setIsProfileLoading(true);
      await uploadAvatar(avatarFile);
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfileSuccess('Avatar atualizado com sucesso');
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao fazer upload do avatar');
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Validação e envio do formulário de perfil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // Verificar se algo mudou
      const hasChanges = 
        profileForm.email !== user?.email ||
        profileForm.username !== user?.username ||
        profileForm.fullName !== user?.fullName;

      // Se temos um novo arquivo de avatar, fazer upload primeiro
      if (avatarFile) {
        await handleUploadAvatar();
      }

      // Se temos mudanças no perfil, atualizar
      if (hasChanges) {
        // Mapear os campos corretamente para o backend
        const updateData = {
          email: profileForm.email,
          username: profileForm.username,
          full_name: profileForm.fullName // Mapear fullName para full_name
        };
        await updateUser(updateData);
        setProfileSuccess('Perfil atualizado com sucesso');
      } else if (!avatarFile) {
        setProfileSuccess('Nenhuma alteração detectada');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Validação e envio do formulário de senha
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar senhas
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // Limpar formulário
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess('Senha atualizada com sucesso');
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar senha');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Função para fazer logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Meu Perfil</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Informações Pessoais</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Atualize suas informações de conta</p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative">
                        {avatarFile ? (
                          <img 
                            src={avatarPreview} 
                            alt="Preview do avatar" 
                            className="h-32 w-32 rounded-full object-cover border-4 border-primary-500"
                          />
                        ) : (
                          <AvatarImage
                            avatar={user?.avatar}
                            alt="Avatar do usuário"
                            size="xl"
                            className="border-4 border-primary-500"
                          />
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <AvatarImage
                        avatar={user?.avatar}
                        alt="Avatar do usuário"
                        size="xl"
                        className="border-4 border-gray-300 dark:border-gray-600"
                      />
                    )}
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Clique para alterar seu avatar
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="seu@email.com"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome de usuário
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Nome de usuário"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome completo
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Seu nome completo"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                
                {profileError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                    <div className="text-sm text-red-700 dark:text-red-200">
                      {profileError}
                    </div>
                  </div>
                )}
                
                {profileSuccess && (
                  <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
                    <div className="text-sm text-green-700 dark:text-green-200">
                      {profileSuccess}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-700 dark:hover:bg-primary-600"
                  >
                    {isProfileLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Edit3 className="w-5 h-5" />
                    )}
                    Salvar alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Alterar Senha</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Atualize sua senha de acesso</p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha atual
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      id="currentPassword"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Sua senha atual"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nova senha
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      id="newPassword"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Nova senha (mínimo 8 caracteres)"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar nova senha
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      id="confirmPassword"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Confirme sua nova senha"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {passwordError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                    <div className="text-sm text-red-700 dark:text-red-200">
                      {passwordError}
                    </div>
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
                    <div className="text-sm text-green-700 dark:text-green-200">
                      {passwordSuccess}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-700 dark:hover:bg-primary-600"
                  >
                    {isPasswordLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Lock className="w-5 h-5 mr-2" />
                    )}
                    Alterar senha
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;