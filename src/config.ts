/**
 * Configurações centralizadas da aplicação.
 * Todas as URLs e constantes importantes devem estar aqui.
 */

// A URL base da sua API Django.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

// URLs da API
export const SUWAYOMI_SERVER = API_BASE_URL;

// Configurações de Cache
export const CACHE_CONFIG = {
    PROVIDERS_TTL: 5 * 60 * 1000, // 5 minutos
    MANGA_TTL: 3 * 60 * 1000,     // 3 minutos
    IMAGES_TTL: 30 * 60 * 1000,   // 30 minutos
};

// Configurações de UI
export const UI_CONFIG = {
    NOTIFICATION_DURATION: 4000,
    DEBOUNCE_DELAY: 800,
    INFINITE_SCROLL_THRESHOLD: 200,
    MAX_HISTORY_ITEMS: 100,
};

// RemoteStorage
export const REMOTE_STORAGE_CONFIG = {
    MODULE_NAME: 'cubari',
    AUTO_CLEANUP_INTERVAL: 5000,
    MAX_NOTIFICATION_AGE: 30000,
};
