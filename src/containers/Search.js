// src/containers/Search.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Container from '../components/Container';
import MangaCard from '../components/MangaCard';
import Section from '../components/Section';
import { SpinIcon } from '../components/Spinner';
import { classNames } from '../utils/strings';
import { useLanguageFilter } from '../context/LanguageFilterContext';
import useDiscoverData from '../hooks/useDiscoverData';
import useAdvancedNotification from '../hooks/useAdvancedNotification';
import { API_BASE_URL } from '../config';
import { SearchIcon, XIcon, ExclamationIcon } from '@heroicons/react/solid';
import { OFFICIAL_LICENSED_PROVIDERS } from '../utils/sourceConstants';
import { useProviderContext } from '../context/ProviderContext'; // <-- Importar ProviderContext

const Search = () => {
    const { t } = useTranslation();
    const { selectedLanguage } = useLanguageFilter();
    const { enabledProviderIdsOrder, allApiProviders, isLoadingContext } = useProviderContext();
    
    // Assumindo que useDiscoverData pode precisar de uma forma de ser atualizado, como refreshProviders
    const { providers } = useDiscoverData(
        selectedLanguage, 
        enabledProviderIdsOrder, 
        !isLoadingContext, 
        allApiProviders
    );
    const { currentNotification, showNotification, hideNotification } = useAdvancedNotification();
    
    // Estados simplificados
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [searchCache, setSearchCache] = useState(new Map());
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    // Usa o hook do React Router para obter o termo de busca da URL
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('query') || '';

    // EFEITO PARA LIDAR COM MUDANÇAS NAS FONTES ATIVAS GLOBAIS
    useEffect(() => {
        const handleProvidersChangedGlobal = (event) => {
            console.log('[Search.js] Evento providersChanged recebido:', event.detail);
            showNotification('Fontes disponíveis atualizadas. Refazendo busca se necessário...', 'info');
            
            // Limpar o cache de busca, pois as fontes mudaram
            setSearchCache(new Map());
            
            // Forçar a atualização da lista de providers no useDiscoverData
            // A lógica de performGlobalSearch no useEffect abaixo será acionada se 'providers' mudar.
            // Se uma busca estava ativa, ela será refeita com as novas fontes.
            // Se não havia busca, apenas a lista de providers é atualizada para futuras buscas.
        };

        window.addEventListener('providersChanged', handleProvidersChangedGlobal);
        console.log('[Search.js] Event listener para providersChanged ADICIONADO');

        return () => {
            window.removeEventListener('providersChanged', handleProvidersChangedGlobal);
            console.log('[Search.js] Event listener para providersChanged REMOVIDO');
        };
    }, [showNotification]); // Adicionado refreshDiscoverProviders e showNotification

    // Listener para mudanças na ORDEM dos providers (já existia, pode ser mantido ou integrado)
    // Se providersChanged já causa um refresh que atualiza a ordem, este pode ser redundante.
    // Por ora, vou manter, mas comentar a parte de refazer a busca se providersChanged já cuida disso.
    useEffect(() => {
        const handleProviderOrderChange = (event) => {
            console.log('[Search.js] Evento providerOrderChanged recebido:', event.detail.newOrder);
            // Se o listener de providersChanged já força um refresh e refaz a busca, 
            // esta lógica específica para ordem pode não precisar refazer a busca explicitamente.
            // Apenas a notificação pode ser suficiente.
            // if (query.trim() && searchPerformed) {
            //     setSearchCache(new Map()); 
            // }
            showNotification('Ordem de busca atualizada!', 'info');
        };
        window.addEventListener('providerOrderChanged', handleProviderOrderChange);
        return () => window.removeEventListener('providerOrderChanged', handleProviderOrderChange);
    }, [query, searchPerformed, showNotification]);

    // Função de busca global simplificada
    useEffect(() => {
        const performGlobalSearch = async () => {
            if (!query.trim()) {
                setResults([]);
                setSearchPerformed(false);
                setError(null);
                return;
            }
            
            // Verificar se há providers disponíveis
            if (!providers || providers.length === 0) {
                const userDisabledAll = localStorage.getItem('userDisabledAll') === 'true';
                if (userDisabledAll) {
                    setError('Todas as fontes foram desabilitadas. Ative pelo menos uma fonte na aba "Fontes" para realizar buscas.');
                } else {
                    setError('Nenhuma fonte disponível para busca. Configure suas fontes na aba "Fontes".');
                }
                setResults([]);
                setSearchPerformed(true);
                return;
            }

            // Verificar cache primeiro
            const cacheKey = getCacheKey(query);
            const cachedResult = searchCache.get(cacheKey);
            
            if (cachedResult) {
                console.log(`✨ Usando cache para busca global: "${query}"`);
                setResults(cachedResult.results);
                setSearchPerformed(true);
                setError(null);
                showNotification(`${cachedResult.results.length} resultado${cachedResult.results.length !== 1 ? 's' : ''} (cache)`, 'info');
                return;
            }

            setIsTransitioning(true);
            setIsLoading(true);            setSearchPerformed(true);
            setError(null);

            try {
                console.log(`🔍 Iniciando busca global: "${query}" em ${providers.length} fontes`);
                
                if (providers.length === 0) {
                    throw new Error('Nenhuma fonte disponível para busca');
                }
                
                // Busca global em todas as fontes habilitadas - limitada para performance
                const enabledProviders = providers.slice(0, 6); // Máximo 6 fontes simultâneas
                
                const searchPromises = enabledProviders.map(async (provider) => {
                    const isSlowProvider = provider.name.toLowerCase().includes('scan') || 
                                         provider.name.toLowerCase().includes('gekkou') ||
                                         provider.is_nsfw;
                    
                    const controller = new AbortController();
                    const timeoutDuration = isSlowProvider ? 25000 : 20000;
                    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
                    
                    try {
                        const response = await fetch(
                            `${API_BASE_URL}/content-discovery/search/?provider_id=${provider.id}&query=${encodeURIComponent(query.trim())}&type=SEARCH`,
                            { signal: controller.signal }
                        );
                        
                        clearTimeout(timeoutId);
                        
                        if (response.ok) {
                            const data = await response.json();
                            return { 
                                provider: provider.name,
                                results: data.results || [],
                                success: true 
                            };
                        } else {
                            console.warn(`Provider ${provider.name} retornou erro ${response.status}`);
                            return { provider: provider.name, results: [], success: false };
                        }
                    } catch (error) {
                        clearTimeout(timeoutId);
                        if (error.name === 'AbortError') {
                            console.warn(`Provider ${provider.name} timeout na busca`);
                        } else {
                            console.warn(`Provider ${provider.name} erro:`, error.message);
                        }
                        return { provider: provider.name, results: [], success: false };
                    }
                });
                
                const resultsByProvider = await Promise.all(searchPromises);
                const allResults = resultsByProvider.flatMap(data => data.results);
                const successfulProviders = resultsByProvider.filter(data => data.success).length;
                
                // Remover duplicatas baseado em provider_id + content_id
                const uniqueResults = allResults.filter((manga, index, self) => 
                    self.findIndex(m => m.provider_id === manga.provider_id && m.content_id === manga.content_id) === index
                );
                
                // Ordenar por relevância (providers com mais resultados primeiro, depois alfabético)
                const sortedResults = uniqueResults.sort((a, b) => {
                    // Priorizar mangás de providers que retornaram mais resultados
                    const providerA = resultsByProvider.find(p => p.results.some(r => r.provider_id === a.provider_id));
                    const providerB = resultsByProvider.find(p => p.results.some(r => r.provider_id === b.provider_id));
                    
                    if (providerA && providerB) {
                        const countA = providerA.results.length;
                        const countB = providerB.results.length;
                        if (countA !== countB) return countB - countA;
                    }
                    
                    // Ordenação alfabética como fallback
                    return a.title.localeCompare(b.title);
                });
                
                setResults(sortedResults);
                
                // Salvar no cache
                setSearchCache(prev => new Map(prev.set(cacheKey, { results: sortedResults, timestamp: Date.now() })));
                
                if (sortedResults.length > 0) {
                    showNotification(`${sortedResults.length} resultado${sortedResults.length !== 1 ? 's' : ''} encontrado${sortedResults.length !== 1 ? 's' : ''} em ${successfulProviders} fonte${successfulProviders !== 1 ? 's' : ''}`, 'success');
                } else {
                    showNotification(`Nenhum resultado encontrado para "${query.trim()}" nas fontes disponíveis`, 'warning');
                }
                
            } catch (err) {
                console.error("Erro na busca global:", err);
                if (err.name === 'AbortError') {
                    showNotification('Busca cancelada por timeout. Tente um termo mais específico.', 'error');
                } else {
                    showNotification(err.message || 'Erro ao realizar busca. Tente novamente.', 'error');
                }
                setError(err.message || 'Erro na busca global');
            } finally {
                setIsLoading(false);
                setTimeout(() => setIsTransitioning(false), 300);
            }
        };

        if (providers && providers.length > 0 && query.trim()) {
            performGlobalSearch();
        } else if (!query.trim()) {
            setResults([]);
            setSearchPerformed(false);
            setError(null);
        } else if (providers && providers.length === 0 && query.trim()) {
            // Se há uma query mas não há providers (após um refresh, por exemplo)
            setError('Nenhuma fonte ativa para buscar. Verifique suas configurações de fontes.');
            setResults([]);
            setSearchPerformed(true);
        }

    }, [query, providers, searchCache, showNotification]); // showNotification adicionado se usado dentro

    // Componente de Skeleton Loading
    const SkeletonMangaCard = () => (
        <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 w-full mb-3"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    );

    const SkeletonGrid = () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
            {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonMangaCard key={index} />
            ))}
        </div>    );

    // Função para obter providers fallback baseado no idioma
    const getFallbackProviders = (availableProviders, language) => {
        const priorityByLanguage = {
            'pt': ['MangaHost', 'Central de Mangás', 'Mangás Chan'],
            'pt-BR': ['MangaHost', 'Central de Mangás', 'Mangás Chan'],
            'en': ['MangaDex', 'MangaKakalot', 'MangaFire'],
            'es': ['MangaDex', 'LectorManga', 'TuMangaOnline'],
            'all': ['MangaDex', 'MangaHost', 'Central de Mangás']
        };

        const fallbackNames = priorityByLanguage[language] || priorityByLanguage['all'];
        return availableProviders.filter(p => fallbackNames.includes(p.name)).slice(0, 3);
    };    // Função para gerar chave de cache - simplificada para busca global
    const getCacheKey = (searchQuery) => {        return `global_${searchQuery.trim().toLowerCase()}`;
    };

    return (
        <Container>
            {/* Notificação Sutil no Topo */}
            {currentNotification && (
                <div className={classNames(
                    "fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out",                    currentNotification.type === 'success' && "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
                    currentNotification.type === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
                    currentNotification.type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
                    currentNotification.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
                )}>
                    <div className="flex items-start">
                        <div className="flex-shrink-0">                            {currentNotification.type === 'success' && (
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            {currentNotification.type === 'warning' && (
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {currentNotification.type === 'error' && (
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {currentNotification.type === 'info' && (
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium">{currentNotification.message}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <button
                                onClick={() => hideNotification()}
                                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}            {/* Cabeçalho da página - melhorado */}
            <div className="mb-6">
                <Section text={t('search.title')} subText={query ? t('search.resultsFor', { query }) : t('search.prompt')} />
                
                {/* Indicador de fontes disponíveis */}
                {providers.length > 0 && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-green-50 text-gray-700 dark:from-blue-900/30 dark:to-green-900/30 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
                            <SearchIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <span>Busca global em</span>
                            <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                                {providers.length} fonte{providers.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>            {/* Tela quando não há fontes configuradas */}
            {providers.length === 0 && (
                <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                        <ExclamationIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Nenhuma fonte configurada
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Configure suas fontes preferidas na aba Fontes para realizar buscas globais.
                        </p>
                        <button
                            onClick={() => window.location.hash = '#/sources'}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Configurar Fontes
                        </button>
                    </div>
                </div>
            )}

            {/* Estados de loading e skeleton */}
            {isLoading && providers.length > 0 && (
                <div>
                    <div className="mb-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-gray-300 border border-blue-200 dark:border-blue-700">
                            <SpinIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                            <span>Buscando "{query}" em {providers.length} fonte{providers.length !== 1 ? 's' : ''}...</span>
                        </div>
                    </div>
                    <SkeletonGrid />
                </div>
            )}

            {/* Resultados da busca global */}
            {!isLoading && searchPerformed && results.length === 0 && !error && providers.length > 0 && (
                <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                        <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Nenhum resultado encontrado
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Não foram encontrados resultados para "<strong>{query}</strong>" em nenhuma das {providers.length} fonte{providers.length !== 1 ? 's' : ''} configurada{providers.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <p>💡 Tente:</p>
                            <ul className="space-y-1">
                                <li>• Termos de busca diferentes</li>
                                <li>• Verificar a ortografia</li>
                                <li>• Usar termos mais genéricos</li>
                                <li>• Adicionar mais fontes na aba Fontes</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div>
                    {/* Indicador de resultados globais */}
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-blue-50 text-gray-700 dark:from-green-900/30 dark:to-blue-900/30 dark:text-gray-300 border border-green-200 dark:border-green-700">
                            <SearchIcon className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                            <span className="font-semibold">Busca Global:</span>
                            <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                                {results.length} mangá{results.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                                (de {providers.length} fonte{providers.length !== 1 ? 's' : ''})
                            </span>
                        </div>
                    </div>
                    
                    {/* Grid de resultados */}
                    <div className={classNames(
                        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-300 ease-in-out",
                        isTransitioning ? "opacity-70 transform scale-95" : "opacity-100 transform scale-100"
                    )}>                        {results.map((manga, index) => {
                            // Encontrar o provider pelo ID para obter o nome
                            const provider = providers.find(p => p.id === manga.provider_id);
                            
                            return (
                                <MangaCard
                                    key={`${manga.provider_id}-${manga.content_id}-${index}`}
                                    provider_id={manga.provider_id}
                                    content_id={manga.content_id}
                                    mangaUrl={`#/reader/${manga.provider_id}/${manga.content_id}`}
                                    coverUrl={manga.thumbnail_url_proxy}
                                    mangaTitle={manga.title}
                                    providerName={provider?.name || 'Fonte desconhecida'}
                                    showProvider={true}
                                />
                            );
                        })}
                    </div>

                    {/* Informações detalhadas sobre as fontes (opcional) */}
                    {results.length > 0 && query && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <details className="group">
                                <summary className="flex items-center justify-center cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                    <span>Ver detalhes das fontes</span>
                                    <svg className="w-4 h-4 ml-2 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                                    <p>Resultados ordenados por relevância • Duplicatas removidas automaticamente</p>
                                    <p className="mt-1">Buscando em: {providers.map(p => p.name).join(', ')}</p>
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                        <ExclamationIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Erro na busca
                        </h3>
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default Search;