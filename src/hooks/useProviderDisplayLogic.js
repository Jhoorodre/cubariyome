// src/hooks/useProviderDisplayLogic.js
import { useMemo, useCallback } from 'react';
import { 
    OFFICIAL_LICENSED_PROVIDERS, 
    KNOWN_SAFE_BRAZILIAN_PROVIDERS // Corrigido o nome da constante importada
} from '../utils/sourceConstants';

export const useProviderDisplayLogic = (
    allProviders, 
    selectedLanguage,
    searchTerm
) => {
    // Função para filtrar providers com base nos seletores da UI (busca e idioma)
    // Movida para dentro do hook
    const filterProviders = useCallback((providersToFilter) => {
        let filtered = providersToFilter || []; // Garantir que não seja undefined
        if (selectedLanguage !== 'all') {
            if (selectedLanguage === 'pt') {
                filtered = filtered.filter(provider => 
                    provider.language === 'pt' || provider.language === 'pt-BR'
                );
            } else {
                filtered = filtered.filter(provider => 
                    provider.language === selectedLanguage
                );
            }
        }
        // Assegurar que provider.name existe antes de chamar toLowerCase()
        if (searchTerm) {
            filtered = filtered.filter(provider => 
                (provider.name && provider.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (provider.language && provider.language.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return filtered;
    }, [selectedLanguage, searchTerm]);

    // Função para categorizar providers para exibição na UI
    // Movida para dentro do hook
    const categorizeProviders = useCallback((providersToCategorize) => {
        const categories = {
            official: [], global: [], brazilian: [], spanish: [], english: [], nsfw: [],
        };
        const addedOfficialNames = new Set();

        (providersToCategorize || []).forEach(provider => {
            const providerName = provider.name;
            const providerLang = provider.language;
            const isNsfwProvider = provider.is_nsfw;

            // Para Fontes Oficiais, se selectedLanguage === 'all', mostra todas as versões oficiais
            if (OFFICIAL_LICENSED_PROVIDERS.includes(providerName)) {
                if (!addedOfficialNames.has(providerName)) {
                    if (selectedLanguage === 'all') {
                        // Adiciona todas as versões oficiais, independentemente do idioma
                        const allVersions = (providersToCategorize || []).filter(p => p.name === providerName);
                        categories.official.push(...allVersions);
                    } else {
                        // Adiciona apenas a versão do idioma filtrado
                        const version = (providersToCategorize || []).find(p => p.name === providerName && (p.language === selectedLanguage || (selectedLanguage === 'pt' && p.language === 'pt-BR')));
                        if (version) categories.official.push(version);
                    }
                    addedOfficialNames.add(providerName);
                }
            }

            // Demais categorias seguem o filtro estrito
            if (providerLang === 'all') {
                categories.global.push(provider);
            } else if (providerLang === 'pt' || providerLang === 'pt-BR' || 
                       KNOWN_SAFE_BRAZILIAN_PROVIDERS.includes(providerName) ||
                       (providerName && (providerName.includes('Brasil') || providerName.includes('BR')))) {
                categories.brazilian.push(provider);
            } else if (providerLang === 'es' || providerLang === 'es-419') {
                categories.spanish.push(provider);
            } else if (providerLang === 'en') {
                categories.english.push(provider);
            }

            if (isNsfwProvider) {
                categories.nsfw.push(provider);
            }
        });
        // Remove duplicatas em 'official'
        categories.official = Array.from(new Set(categories.official));
        return categories;
    }, [OFFICIAL_LICENSED_PROVIDERS, KNOWN_SAFE_BRAZILIAN_PROVIDERS, selectedLanguage]); // Adicionar ao array de dependências

    const filteredProvidersForUI = useMemo(() => {
        return filterProviders(allProviders || []); // Garante que allProviders não seja undefined
    }, [allProviders, filterProviders]);

    const categorizedData = useMemo(() => {
        return categorizeProviders(filteredProvidersForUI);
    }, [filteredProvidersForUI, categorizeProviders]);

    return { 
        filteredProvidersForUI, // Lista de providers após filtros de UI (para contagem de busca, etc.)
        categorizedData         // Objeto com as categorias (official, global, etc.)
    };
};