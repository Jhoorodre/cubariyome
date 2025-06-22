// src/hooks/useProviderError.js
import { useState, useCallback } from 'react';

const useProviderError = () => {
    const [providerErrors, setProviderErrors] = useState(new Map());

    const setProviderError = useCallback((providerId, error) => {
        setProviderErrors(prev => {
            const newErrors = new Map(prev);
            if (error) {
                newErrors.set(providerId, error);
            } else {
                newErrors.delete(providerId);
            }
            return newErrors;
        });
    }, []);

    const getProviderError = useCallback((providerId) => {
        return providerErrors.get(providerId);
    }, [providerErrors]);

    const clearProviderError = useCallback((providerId) => {
        setProviderError(providerId, null);
    }, [setProviderError]);

    const clearAllErrors = useCallback(() => {
        setProviderErrors(new Map());
    }, []);

    const hasError = useCallback((providerId) => {
        return providerErrors.has(providerId);
    }, [providerErrors]);

    return {
        setProviderError,
        getProviderError,
        clearProviderError,
        clearAllErrors,
        hasError,
        errorCount: providerErrors.size
    };
};

export default useProviderError;
