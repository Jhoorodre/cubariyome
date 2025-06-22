// src/hooks/useDiscoverData.js
import { useState, useEffect, useCallback } from 'react';

const useDiscoverData = (selectedLanguage, enabledProviderIdsOrder = [], contextIsInitialized, allApiProvidersFromContext = []) => {
    const [processedProviders, setProcessedProviders] = useState([]); // Renomeado de 'providers' para evitar confusão
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);

    const filterProvidersByLanguage = useCallback((providersToFilter, lang) => {
        if (!providersToFilter || providersToFilter.length === 0) return [];
        if (lang === 'all') {
            return providersToFilter.filter(provider => {
                const pLang = provider.language;
                return pLang === 'all' || pLang === 'pt-BR' || pLang === 'en' || pLang === 'es' || pLang === 'pt';
            });
        } else if (lang === 'pt') {
            return providersToFilter.filter(provider => {
                const pLang = provider.language;
                return pLang === 'pt-BR' || pLang === 'pt' || pLang === 'all';
            });
        } else {
            return providersToFilter.filter(provider => provider.language === lang);
        }
    }, []);

    const filterAndOrderEnabledProviders = useCallback((providersToFilter, enabledIds) => {
        if (!providersToFilter || providersToFilter.length === 0 || !enabledIds || enabledIds.length === 0) return [];
        
        const providerMap = new Map();
        providersToFilter.forEach(p => providerMap.set(p.id, p));
        
        return enabledIds.map(id => providerMap.get(id)).filter(Boolean);
    }, []);

    const processData = useCallback(() => {
        console.log("[useDiscoverData] processData chamado. contextIsInitialized:", contextIsInitialized, "allApiProvidersFromContext:", allApiProvidersFromContext ? allApiProvidersFromContext.length : 0);

        if (!contextIsInitialized) {
            console.log("[useDiscoverData] Contexto não inicializado. Adiar processamento.");
            setIsLoading(true);
            setProcessedProviders([]); // Limpa os providers se o contexto não estiver pronto
            return;
        }

        if (!allApiProvidersFromContext || allApiProvidersFromContext.length === 0) {
            console.log("[useDiscoverData] allApiProvidersFromContext está vazio. Nada a processar.");
            // Isso pode ser normal se o contexto ainda estiver carregando allApiProviders, ou se houve erro no contexto.
            // O isLoading do contexto deve ser verificado pelo componente Discover.js.
            setIsLoading(false); // Não está carregando DADOS DESTE HOOK, mas pode não haver dados para processar.
            setProcessedProviders([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            console.log('[useDiscoverData] Processando com allApiProvidersFromContext:', allApiProvidersFromContext.length);
            
            let languageFiltered = filterProvidersByLanguage(allApiProvidersFromContext, selectedLanguage);
            console.log('[useDiscoverData] Providers após filtro de idioma:', languageFiltered.length > 0 ? languageFiltered.map(p => `${p.name} [${p.id}]`) : 'Nenhum');
            
            console.log('[useDiscoverData] enabledProviderIdsOrder para filtro final:', JSON.stringify(enabledProviderIdsOrder));
            
            // EXPANSÃO DE PROVIDERS GLOBAIS: se algum provider global (language 'all') estiver ativado, incluir suas versões específicas
            const expandedProviders = [];
            const globalProviders = languageFiltered.filter(p => p.language === 'all');
            const alreadyIncludedIds = new Set();
            // Adiciona todos os providers filtrados normalmente
            languageFiltered.forEach(p => {
                expandedProviders.push(p);
                alreadyIncludedIds.add(p.id);
            });
            // Para cada global ativado, adiciona suas versões específicas (por idioma), se não estiverem já incluídas
            globalProviders.forEach(globalP => {
                const versions = allApiProvidersFromContext.filter(p => p.name === globalP.name && p.language !== 'all');
                versions.forEach(v => {
                    if (!alreadyIncludedIds.has(v.id)) {
                        expandedProviders.push(v);
                        alreadyIncludedIds.add(v.id);
                    }
                });
            });

            // Mantém apenas os providers ativados e na ordem correta
            const finalFilteredProviders = filterAndOrderEnabledProviders(expandedProviders, enabledProviderIdsOrder);
            setProcessedProviders(finalFilteredProviders);

        } catch (err) {
            console.error('[useDiscoverData] Erro em processData:', err);
            setError(err.message || 'Erro ao processar dados dos provedores.');
            setProcessedProviders([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedLanguage, enabledProviderIdsOrder, contextIsInitialized, allApiProvidersFromContext, filterProvidersByLanguage, filterAndOrderEnabledProviders]);

    useEffect(() => {
        console.log("[useDiscoverData] useEffect disparado. Deps:", {selectedLanguage, enabledProviderIdsOrderCount: enabledProviderIdsOrder.length, contextIsInitialized, allApiProvidersCount: allApiProvidersFromContext.length});
        processData();
    }, [processData]); // processData já tem todas as dependências corretas

    // Renomeado o retorno para `processedProviders` para clareza
    return { providers: processedProviders, isLoading, error, refetch: processData }; 
};

export default useDiscoverData;
