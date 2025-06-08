// Utilitários para manipulação de imagens

// Função para construir URL do avatar de forma consistente
export const getAvatarUrl = (avatar: string | null | undefined): string | null => {
  if (!avatar) return null;
  
  // Se já é uma URL completa, retorna como está
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // Constrói a URL baseada na configuração da API
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const apiBaseUrl = baseUrl.replace('/api', ''); // Remove /api do final
  
  // Se o avatar já contém o caminho completo
  if (avatar.startsWith('/uploads/')) {
    return `${apiBaseUrl}${avatar}`;
  }
  
  // Se é apenas o nome do arquivo
  const filename = avatar.split('/').pop();
  return `${apiBaseUrl}/uploads/avatars/${filename}`;
};

// Função para adicionar timestamp para evitar cache
export const getAvatarUrlWithTimestamp = (avatar: string | null | undefined): string | null => {
  const url = getAvatarUrl(avatar);
  if (!url) return null;
  
  // Adiciona timestamp para evitar problemas de cache
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

// Função para validar se uma imagem existe
export const validateImageUrl = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Função para criar preview de arquivo
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};