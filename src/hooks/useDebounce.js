// src/hooks/useDebounce.js
import { useState, useEffect, useCallback, useMemo } from 'react';

// Hook para debounce de valores
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook para debounce de funções
export const useDebouncedCallback = (callback, delay, deps = []) => {
    const debouncedCallback = useMemo(() => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback.apply(null, args), delay);
        };
    }, [callback, delay, ...deps]);

    return debouncedCallback;
};

export default useDebounce;
