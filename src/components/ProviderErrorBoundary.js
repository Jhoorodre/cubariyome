// src/components/ProviderErrorBoundary.js
import React from 'react';
import { RefreshIcon } from '@heroicons/react/solid';

const ProviderErrorBoundary = ({ 
    error, 
    onRetry, 
    providerName, 
    isRetrying = false,
    children 
}) => {
    if (!error) {
        return children;
    }

    const getErrorMessage = (error) => {
        if (error.includes('400')) {
            return 'Esta fonte não suporta esse tipo de busca.';
        }
        if (error.includes('502') || error.includes('503')) {
            return 'Esta fonte está temporariamente indisponível.';
        }
        if (error.includes('404')) {
            return 'Nenhum conteúdo encontrado nesta fonte.';
        }
        return 'Erro de conexão com a fonte.';
    };

    const getErrorIcon = (error) => {
        if (error.includes('400')) {
            return '🚫';
        }
        if (error.includes('502') || error.includes('503')) {
            return '⏳';
        }
        if (error.includes('404')) {
            return '🔍';
        }
        return '⚠️';
    };

    const showRetryButton = !error.includes('400'); // Não mostrar retry para erro 400

    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{getErrorIcon(error)}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {providerName || 'Fonte'} Indisponível
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                {getErrorMessage(error)}
            </p>
            
            {showRetryButton && (
                <button
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <RefreshIcon className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Tentando...' : 'Tentar Novamente'}
                </button>
            )}
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>💡 Dica: Tente trocar para outra fonte ou tipo de busca</p>
            </div>
        </div>
    );
};

export default ProviderErrorBoundary;
