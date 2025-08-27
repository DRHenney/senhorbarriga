import React from 'react';

interface PoolAvatarProps {
  token1Symbol: string;
  token2Symbol: string;
  token1ImageUrl?: string;
  token2ImageUrl?: string;
  size?: number;
  className?: string;
}

export default function PoolAvatar({
  token1Symbol,
  token2Symbol,
  token1ImageUrl,
  token2ImageUrl,
  size = 32,
  className = ""
}: PoolAvatarProps) {
  // Função para gerar cor baseada no símbolo do token
  const getTokenColor = (symbol: string) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#F97316', // orange
      '#EC4899', // pink
      '#6366F1', // indigo
    ];
    
    const hash = symbol.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Função para gerar inicial do token
  const getTokenInitial = (symbol: string) => {
    return symbol.charAt(0).toUpperCase();
  };

  // Função para verificar se a URL da imagem é válida
  const isValidImageUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith('http') && (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.svg') || url.includes('.webp'));
  };

  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ 
        width: size, 
        height: size,
        minWidth: size,
        minHeight: size
      }}
    >
      {/* Token 1 (esquerda) */}
      <div 
        className="absolute left-0 top-0 w-1/2 h-full flex items-center justify-center"
        style={{ backgroundColor: getTokenColor(token1Symbol) }}
      >
        {isValidImageUrl(token1ImageUrl) ? (
          <img 
            src={token1ImageUrl} 
            alt={token1Symbol}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Se a imagem falhar, mostrar inicial
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span 
          className={`text-white font-bold text-xs ${isValidImageUrl(token1ImageUrl) ? 'hidden' : ''}`}
          style={{ fontSize: `${Math.max(8, size * 0.25)}px` }}
        >
          {getTokenInitial(token1Symbol)}
        </span>
      </div>

      {/* Token 2 (direita) */}
      <div 
        className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center"
        style={{ backgroundColor: getTokenColor(token2Symbol) }}
      >
        {isValidImageUrl(token2ImageUrl) ? (
          <img 
            src={token2ImageUrl} 
            alt={token2Symbol}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Se a imagem falhar, mostrar inicial
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <span 
          className={`text-white font-bold text-xs ${isValidImageUrl(token2ImageUrl) ? 'hidden' : ''}`}
          style={{ fontSize: `${Math.max(8, size * 0.25)}px` }}
        >
          {getTokenInitial(token2Symbol)}
        </span>
      </div>

      {/* Separador vertical no meio */}
      <div className="absolute left-1/2 top-0 w-px h-full bg-white/20 transform -translate-x-1/2" />
    </div>
  );
}
