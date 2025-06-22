// src/components/SearchFilters.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeartIcon, ClockIcon, AdjustmentsIcon, SearchIcon, XIcon } from '@heroicons/react/solid';
import { SpinIcon } from './Spinner';
import { classNames } from '../utils/strings';

const SearchFilters = React.memo(({ 
    searchType, 
    onSearchTypeChange,
    searchQuery,
    onSearchQueryChange,
    onSearch,
    isSearching,
    showFilters,
    onToggleFilters,
    showInlineSearch,
    onCloseInlineSearch
}) => {
    const { t } = useTranslation();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <>
            {/* Abas de Filtro */}
            <div className="mb-6">
                <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => onSearchTypeChange('POPULAR')}
                        className={classNames(
                            "flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            searchType === 'POPULAR'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}                    >
                        <HeartIcon className="w-4 h-4 mr-1" />
                        {t('discover.popular')}
                    </button>
                    <button
                        onClick={() => onSearchTypeChange('LATEST')}
                        className={classNames(
                            "flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            searchType === 'LATEST'
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}                    >
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {t('discover.latest')}
                    </button>                    <button
                        onClick={() => onSearchTypeChange('SEARCH')}
                        className={classNames(
                            "flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            searchType === 'SEARCH' || showInlineSearch
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <SearchIcon className="w-4 h-4 mr-1" />
                        {t('discover.search')}
                        {showInlineSearch && (
                            <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                    </button>
                    <button
                        onClick={onToggleFilters}
                        className={classNames(
                            "flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                            showFilters
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}                    >
                        <AdjustmentsIcon className="w-4 h-4 mr-1" />
                        {t('discover.filter')}
                    </button>
                </div>
            </div>

            {/* Barra de Busca (visível apenas na aba SEARCH) */}
            {searchType === 'SEARCH' && (
                <div className="mb-6">
                    <div className="flex space-x-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchQueryChange(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('discover.searchPlaceholder')}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <button
                            onClick={onSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isSearching ? <SpinIcon className="w-5 h-5" /> : 'Buscar'}
                        </button>
                    </div>
                    {searchQuery.trim() && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {t('discover.searchHint', { query: searchQuery })}
                        </p>
                    )}
                </div>
            )}

            {/* Painel de Filtros (expansível) */}
            {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                        🚧 Filtros avançados em desenvolvimento...
                    </p>
                </div>
            )}
        </>
    );
});

SearchFilters.displayName = 'SearchFilters';

export default SearchFilters;
