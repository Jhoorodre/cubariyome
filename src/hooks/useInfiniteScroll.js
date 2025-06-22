// src/hooks/useInfiniteScroll.js
import { useEffect, useRef } from 'react';

const useInfiniteScroll = (loadMoreCallback, hasMorePages, isLoading, threshold = 300, scrollTargetRef = null) => {
    const loadMoreCallbackRef = useRef(loadMoreCallback);
    const hasMorePagesRef = useRef(hasMorePages);
    const isLoadingRef = useRef(isLoading);

    useEffect(() => { loadMoreCallbackRef.current = loadMoreCallback; }, [loadMoreCallback]);
    useEffect(() => { hasMorePagesRef.current = hasMorePages; }, [hasMorePages]);
    useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

    useEffect(() => {
        const internalScrollHandler = () => {
            const targetElement = scrollTargetRef?.current;
            if (!targetElement) return; // Se não houver alvo, não faz nada

            const { scrollTop, scrollHeight, clientHeight } = targetElement;

            if (isLoadingRef.current || !hasMorePagesRef.current) return;

            if (scrollTop + clientHeight >= scrollHeight - threshold) {
                loadMoreCallbackRef.current();
            }
        };

        const currentTarget = scrollTargetRef?.current;
        if (!currentTarget) return;

        currentTarget.addEventListener('scroll', internalScrollHandler, { passive: true });
        return () => currentTarget.removeEventListener('scroll', internalScrollHandler);
    }, [scrollTargetRef, threshold]);

    return {};
};

export default useInfiniteScroll;
