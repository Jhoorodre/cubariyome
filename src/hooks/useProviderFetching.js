// src/hooks/useProviderFetching.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { 
    // OFFICIAL_LICENSED_PROVIDERS, // Não mais usado aqui diretamente para lógica de primeira visita
    // SUPPORTED_LANGUAGES, // Definido localmente
    // EXPECTED_OFFICIAL_PROVIDERS_COUNT // Definido localmente
} from '../utils/sourceConstants';

const SUPPORTED_LANGUAGES = ['pt', 'pt-BR', 'en', 'es', 'all'];

export const useProviderFetching = () => {
    const [providers, setProviders] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        let isMounted = true; 
        const fetchAndProcessProviders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/content-providers/list/`, {
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                });
                if (!response.ok) {
                    throw new Error(`Erro HTTP ${response.status}: ${response.statusText} ao buscar providers`);
                }
                const data = await response.json();
                const rawProviders = data.providers || data || [];

                if (!isMounted) return;

                const filteredApiProviders = rawProviders.filter(provider => {
                    if (provider.name === 'Local source' || 
                        provider.language === 'localsourcelang' ||
                        (provider.name && provider.name.toLowerCase().includes('local'))) {
                        return false;
                    }
                    return SUPPORTED_LANGUAGES.includes(provider.language);
                });
                
                if (isMounted) {
                    setProviders(filteredApiProviders); 
                }

            } catch (err) {
                if (isMounted) setError(err.message || 'Erro desconhecido.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchAndProcessProviders();

        return () => {
            isMounted = false; 
        };
    }, []);

    return { 
        providers, 
        isLoading, 
        error
    };
};