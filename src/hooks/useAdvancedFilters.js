// src/hooks/useAdvancedFilters.js
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

// Função para buscar os filtros do novo endpoint REST
async function fetchFiltersFromAPI(sourceId) {
    const url = `${API_BASE_URL}/content-discovery/filters/?provider_id=${sourceId}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Erro ao buscar filtros da API REST do backend');
    }
    return response.json();
}

export const useAdvancedFilters = (sourceId) => {
    const [availableFilters, setAvailableFilters] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sourceId) {
            setAvailableFilters([]);
            setSelectedFilters({});
            return;
        }
        const fetchFiltersForSource = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const responseData = await fetchFiltersFromAPI(sourceId);
                setAvailableFilters(responseData.filters || []);
                setSelectedFilters({});
            } catch (err) {
                console.error("Erro ao buscar filtros da fonte:", err);
                setError(err.message);
                setAvailableFilters([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiltersForSource();
    }, [sourceId]);

    // Permite múltiplos tipos de filtro (checkbox, select, etc)
    const handleFilterChange = useCallback((filterName, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterName]: value,
        }));
    }, []);

    return {
        isLoading,
        error,
        availableFilters,
        selectedFilters,
        handleFilterChange
    };
};
