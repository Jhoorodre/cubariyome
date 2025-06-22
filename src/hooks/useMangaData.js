// src/hooks/useMangaData.js
import { useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';

const useMangaData = () => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);
    const currentRequestKey = useRef(null);

    const loadData = useCallback(async (params) => {
        const { providerId, type, query, filters, isLoadMore = false } = params;
        if (!providerId) return;
        if (!type) return;
        // Se não for 'loadMore', é uma nova busca, então resetamos tudo.
        if (!isLoadMore) {
            setItems([]);
            setPage(1);
            setHasMore(true);
            setError(null);
        }
        const currentPage = isLoadMore ? page + 1 : 1;
        const requestKey = `${providerId}-${type}-${JSON.stringify(filters)}-${query}-${currentPage}`;
        // Evita chamadas duplicadas se a mesma requisição já está em andamento
        if (isLoading && currentRequestKey.current === requestKey) return;
        setIsLoading(true);
        currentRequestKey.current = requestKey;
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        try {
            let url = `${API_BASE_URL}/content-discovery/search/?provider_id=${providerId}&page=${currentPage}&type=${type}`;
            if (query) url += `&query=${encodeURIComponent(query)}`;
            if (filters && Object.keys(filters).length > 0) url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
            const response = await fetch(url, { signal: abortControllerRef.current.signal });
            if (!response.ok) throw new Error('Erro na resposta da API.');
            const data = await response.json();
            const newItems = data.results || [];
            setItems(prevItems => isLoadMore ? [...prevItems, ...newItems] : newItems);
            setHasMore(!!data.has_more);
            if (newItems.length > 0) setPage(currentPage);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
                setHasMore(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [page, isLoading]);

    return { items, hasMore, isLoading, error, loadData };
};

export default useMangaData;
