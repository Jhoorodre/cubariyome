// src/components/ProviderIcon.js
import React, { useState } from 'react';
import { SpinIcon } from './Spinner';
import { resolveImageUrl } from '../utils/imageUtils';

function ProviderIcon({ provider, className = "h-6 w-6" }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Se não há URL do ícone ou houve erro, mostra ícone padrão
  if (!provider?.icon_url_proxy || hasError) {
    return <SpinIcon className={`${className} text-gray-400`} />;
  }  // Resolve a URL da imagem
  const iconUrl = resolveImageUrl(provider.icon_url_proxy);

  return (
    <div className="relative">
      <img
        src={iconUrl}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        alt={`${provider.name} icon`}
        onError={handleError}
        onLoad={handleLoad}
      />
      {isLoading && (
        <SpinIcon className={`${className} text-gray-400 absolute inset-0`} />
      )}
    </div>
  );
}

export default ProviderIcon;
