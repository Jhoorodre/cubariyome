// src/components/MangaGrid.js
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MangaCard from './MangaCard';
import Section from './Section';
import { SpinIcon } from './Spinner';
import { SearchIcon } from '@heroicons/react/solid';
import { getProviderDisplayName } from '../utils/providerUtils';
import ProviderErrorBoundary from './ProviderErrorBoundary';

// Componente de Skeleton Loading para melhor UX
const SkeletonMangaCard = React.memo(() => (
    <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 w-full mb-3"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
));

const SkeletonGrid = React.memo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
        {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonMangaCard key={index} />
        ))}
    </div>
));

const EmptyState = React.memo(({ searchType, searchQuery }) => {
    const { t } = useTranslation();
    
    return (
        <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchType === 'SEARCH' && searchQuery ? 
                    t('discover.searchEmpty', { query: searchQuery }) : 
                    'Nenhum conteúdo encontrado'
                }
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
                {searchType === 'SEARCH' ? 
                    'Tente usar termos diferentes ou buscar em outra fonte.' :
                    'Esta fonte pode estar indisponível no momento.'
                }
            </p>
        </div>
    );
});

const MangaGrid = React.memo(({ 
    mangaItems,
    isTransitioning,
    isLoadingMore,
    searchType,
    searchQuery,
    currentProvider,
    providers
}) => {
    const { t } = useTranslation();
    
    const getSectionTitle = useCallback(() => {
        const provider = providers.find(p => p.id === currentProvider);
        const providerName = provider ? getProviderDisplayName(provider) : '';

        switch (searchType) {
            case 'POPULAR':
                return t('discover.popularIn', { source: providerName });
            case 'LATEST':
                return `${t('discover.latest')} de ${providerName}`;
            case 'SEARCH':
                return searchQuery ? t('discover.searchResults', { query: searchQuery }) : 'Resultados';
            default:
                return 'Resultados';
        }
    }, [t, currentProvider, providers, searchType, searchQuery]);

    if (isTransitioning) {
        return <SkeletonGrid />;
    }

    if (!mangaItems || mangaItems.length === 0) {
        return <EmptyState searchType={searchType} searchQuery={searchQuery} />;
    }

    return (
        <>
            <Section text={getSectionTitle()} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {mangaItems.map((manga, index) => (
                    <div key={`${manga.provider_id}-${manga.content_id}-${index}-grid`}>
                        <MangaCard
                            provider_id={manga.provider_id}
                            content_id={manga.content_id}
                            mangaUrl={`#/reader/${manga.provider_id}/${manga.content_id}`}
                            coverUrl={manga.thumbnail_url_proxy}
                            mangaTitle={manga.title}
                            showProvider={false}
                        />
                    </div>
                ))}
            </div>
            {isLoadingMore && (
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-400">
                        <SpinIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm">Carregando mais conteúdo...</span>
                    </div>
                </div>
            )}
        </>
    );
});

MangaGrid.displayName = 'MangaGrid';
SkeletonMangaCard.displayName = 'SkeletonMangaCard';
SkeletonGrid.displayName = 'SkeletonGrid';
EmptyState.displayName = 'EmptyState';

export default MangaGrid;
