import React, { useState } from 'react';
import { User } from 'lucide-react';
import { getAvatarUrlWithTimestamp } from '../utils/imageUtils';

interface AvatarImageProps {
  avatar?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AvatarImage: React.FC<AvatarImageProps> = ({ 
  avatar, 
  alt = 'Avatar', 
  className = '', 
  fallbackClassName = '',
  size = 'md'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const avatarUrl = getAvatarUrlWithTimestamp(avatar);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-32 w-32'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-16 w-16'
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };
  
  if (!avatarUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${fallbackClassName}`}>
        <User className={`${iconSizes[size]} text-gray-400`} />
      </div>
    );
  }
  
  return (
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center animate-pulse`}>
          <User className={`${iconSizes[size]} text-gray-400`} />
        </div>
      )}
      <img
        src={avatarUrl}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default AvatarImage;