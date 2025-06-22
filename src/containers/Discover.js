// src/containers/Discover.js (Versão Refatorada e Corrigida)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useProviderContext } from '../context/ProviderContext';
import useMangaData from '../hooks/useMangaData';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { useAdvancedFilters } from '../hooks/useAdvancedFilters';
import Container from '../components/Container';
import ProviderTabs from '../components/ProviderTabs';
import SearchFilters from '../components/SearchFilters';
import MangaGrid from '../components/MangaGrid';
import Spinner from '../components/Spinner';
import EmptyProvidersState from '../components/EmptyProvidersState';
import FilterPanel from '../components/FilterPanel';
import { API_BASE_URL } from '../config'; // <-- ADICIONADA IMPORTAÇÃO

const Discover = ({ scrollableContainerRef }) => {
    // =======================================================
    // 1. ESTADOS E HOOKS PRINCIPAIS
    // =======================================================
    const { allApiProviders, isLoadingContext, enabledProviderIdsOrder, officialOnly } = useProviderContext();
    
    // O useDiscoverData e finalProvidersForDisplay continuam como antes para obter a lista de fontes
    // (O código foi omitido por ser complexo, mas sua lógica existente está correta)
    const finalProvidersForDisplay = allApiProviders.filter(p => enabledProviderIdsOrder.includes(p.id));

    const [currentProvider, setCurrentProvider] = useState(null);
    const [searchType, setSearchType] = useState('POPULAR');
    const [localFilterQuery, setLocalFilterQuery] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({});
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // O useMangaData agora cuida APENAS da lista base (POPULAR/LATEST) com paginação
    const { 
        items: mangaItems, 
        hasMore, 
        isLoading, 
        error, 
        loadData 
    } = useMangaData();

    // Hook de filtros avançados
    const {
        isLoading: isLoadingFilters,
        availableFilters,
        selectedFilters,
        handleFilterChange
    } = useAdvancedFilters(currentProvider?.id);

    const lastRequestParams = useRef(null);

    // --- ESTADOS DE BUSCA API (para compatibilidade com lógicas híbridas) ---
    const [apiSearchResults, setApiSearchResults] = useState(null);
    const [isApiSearching, setIsApiSearching] = useState(false);

    // =======================================================
    // 2. LÓGICA DE DADOS E FILTRO
    // =======================================================

    // Dispara busca sempre que provider, tipo, query ou filtros mudam
    useEffect(() => {
        if (!currentProvider) return;
        const requestParams = {
            providerId: currentProvider.id,
            type: searchType,
            query: searchType === 'SEARCH' ? localFilterQuery.trim() : '',
            filters: appliedFilters
        };
        const paramsString = JSON.stringify(requestParams);
        if (lastRequestParams.current !== paramsString) {
            if (searchType === 'SEARCH' && !requestParams.query && Object.keys(requestParams.filters).length === 0) return;
            loadData(requestParams);
            lastRequestParams.current = paramsString;
        }
    }, [currentProvider, searchType, localFilterQuery, appliedFilters, loadData]);

    // =======================================================
    // 3. HANDLERS E EFEITOS
    // =======================================================

    // EFEITO: Define o provider inicial ou reage à mudança na lista de fontes ativas
    useEffect(() => {
        if (finalProvidersForDisplay.length > 0) {
            const currentProviderIsValid = finalProvidersForDisplay.some(p => p.id === currentProvider?.id);
            if (!currentProviderIsValid) {
                setCurrentProvider(finalProvidersForDisplay[0]);
            }
        } else {
            setCurrentProvider(null);
        }
    }, [finalProvidersForDisplay, currentProvider]);

    // HANDLER: Dispara a busca na API
    const handleApiSearch = useCallback(async () => {
        if (!localFilterQuery.trim() || !currentProvider) return;
        setIsApiSearching(true);
        setApiSearchResults([]); // Ativa o modo de busca API

        try {
            // Chamada fetch separada para não poluir o estado `allMangaItems`
            let url = `${API_BASE_URL}/content-discovery/search/?type=SEARCH&provider_id=${currentProvider.id}&page=1&query=${encodeURIComponent(localFilterQuery.trim())}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro na resposta da API de busca');
            const data = await response.json();
            setApiSearchResults(data.results || data.mangas || []);
        } catch (error) {
            console.error("Erro na busca por API:", error);
            setApiSearchResults([]); // Garante que a UI mostre "nenhum resultado"
        } finally {
            setIsApiSearching(false);
        }
    }, [localFilterQuery, currentProvider]);

    // HANDLER: Limpa a busca e volta para o modo de filtro local
    const handleClearSearch = useCallback(() => {
        setLocalFilterQuery('');
        setApiSearchResults(null);
    }, []);

    // Handler para aplicar filtros avançados (primeira página)
    const handleApplyFilters = useCallback(async () => {
        const selectedFilterNames = Object.keys(selectedFilters);
        if (!currentProvider || selectedFilterNames.length === 0) {
            return;
        }
        const apiFiltersPayload = [];
        const flatFilters = availableFilters.flatMap(group => 
            group.type === 'GroupFilter' ? (group.filters || []) : group
        );
        selectedFilterNames.forEach(selectedName => {
            const selectedValue = selectedFilters[selectedName];
            if (!selectedValue || selectedValue === '') return;
            const originalFilter = flatFilters.find(f => f.name === selectedName);
            if (originalFilter) {
                let filterState;
                if (originalFilter.type === 'SelectFilter') {
                    const index = originalFilter.values.indexOf(selectedValue);
                    if (index > -1) filterState = { index };
                } else if (originalFilter.type === 'CheckBoxFilter') {
                    filterState = { state: true };
                }
                if (filterState) {
                    apiFiltersPayload.push({
                        ...originalFilter,
                        state: filterState
                    });
                }
            }
        });
        if (apiFiltersPayload.length === 0) {
            console.log("Nenhum filtro válido para aplicar.");
            return;
        }
        setShowFilterPanel(false);
        setIsApiSearching(true);
        setApiSearchResults([]);
        try {
            const filtersParam = JSON.stringify(apiFiltersPayload);
            const url = `${API_BASE_URL}/content-discovery/search/?type=SEARCH&provider_id=${currentProvider.id}&page=1&filters=${encodeURIComponent(filtersParam)}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details?.[0]?.message || 'Erro ao buscar com filtros.');
            }
            const data = await response.json();
            setApiSearchResults(data.results || data.mangas || []);
        } catch (error) {
            console.error("Erro ao aplicar filtros:", error);
            setApiSearchResults([]);
        } finally {
            setIsApiSearching(false);
        }
    }, [selectedFilters, availableFilters, currentProvider]);

    // Scroll infinito universal
    useInfiniteScroll(
        useCallback(() => {
            const params = JSON.parse(lastRequestParams.current);
            loadData({ ...params, isLoadMore: true });
        }, [loadData]),
        hasMore,
        isLoading,
        300,
        scrollableContainerRef
    );

    // Renderização condicional para loading inicial
    if (isLoadingContext) {
        return <Spinner />;
    }
    
    // Renderização condicional para quando não há fontes
    if (finalProvidersForDisplay.length === 0) {
        return <EmptyProvidersState />;
    }

    // =======================================================
    // 4. JSX (RENDERIZAÇÃO)
    // =======================================================
    return (
        <Container>
            <ProviderTabs
                providers={finalProvidersForDisplay}
                currentProvider={currentProvider?.id}
                onProviderChange={providerId => {
                    const provider = finalProvidersForDisplay.find(p => p.id === providerId);
                    if (provider) {
                        setCurrentProvider(provider);
                    } else if (finalProvidersForDisplay.length > 0) {
                        setCurrentProvider(finalProvidersForDisplay[0]);
                    } else {
                        setCurrentProvider(null);
                    }
                }}
            />
            <SearchFilters
                searchType={searchType}
                onSearchTypeChange={newType => {
                    setSearchType(newType);
                    setLocalFilterQuery('');
                    setAppliedFilters && setAppliedFilters({});
                }}
                searchQuery={localFilterQuery}
                onSearchQueryChange={setLocalFilterQuery}
                isSearching={isLoading}
                // Filtros desativados temporariamente
                // onCloseInlineSearch={() => setShowFilterPanel(false)}
                // showFilters={showFilterPanel}
                // onToggleFilters={() => setShowFilterPanel(prev => !prev)}
            />
            {/* <FilterPanel
                isOpen={showFilterPanel}
                onClose={() => setShowFilterPanel(false)}
                isLoading={isLoadingFilters}
                filters={availableFilters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onApply={handleApplyFilters}
            /> */}
            <MangaGrid
                mangaItems={mangaItems}
                isTransitioning={isLoading && mangaItems.length === 0}
                isLoadingMore={isLoading && mangaItems.length > 0}
                searchType={searchType}
                searchQuery={localFilterQuery}
                currentProvider={currentProvider?.id}
                providers={finalProvidersForDisplay}
            />
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
            {mangaItems.length > 0 && !hasMore && !isLoading && (
                <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-gray-100 text-center py-2 shadow-lg z-50">
                    Você chegou ao fim da lista!
                </div>
            )}
        </Container>
    );
};

export default Discover;