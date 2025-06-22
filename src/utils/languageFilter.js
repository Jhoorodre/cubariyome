// src/utils/languageFilter.js
/**
 * Sistema de filtro de idiomas para providers
 */

// Idiomas suportados
export const SUPPORTED_LANGUAGES = {
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    flag: '🇧🇷',
    primary: true
  },
  'en': {
    code: 'en',
    name: 'Inglês',
    flag: '🇺🇸',
    primary: false
  },
  'es': {
    code: 'es',
    name: 'Espanhol',
    flag: '🇪🇸',
    primary: false
  },
  'all': {
    code: 'all',
    name: 'Global',
    flag: '🌍',
    primary: false
  }
};

// Configuração padrão (apenas pt-BR ativo)
const DEFAULT_LANGUAGE_CONFIG = {
  'pt-BR': true,
  'en': false,
  'es': false,
  'all': false
};

/**
 * Obtém a configuração atual de idiomas ativos
 */
export function getActiveLanguages() {
  const saved = localStorage.getItem('activeLanguages');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar configuração de idiomas:', e);
    }
  }
  return DEFAULT_LANGUAGE_CONFIG;
}

/**
 * Salva a configuração de idiomas ativos
 */
export function setActiveLanguages(config) {
  localStorage.setItem('activeLanguages', JSON.stringify(config));
}

/**
 * Verifica se um provider deve ser exibido baseado no idioma
 */
export function shouldShowProvider(provider) {
  const activeLanguages = getActiveLanguages();
  const providerLang = provider.language || 'unknown';
  
  // Mapeia alguns códigos de idioma para nossos códigos suportados
  const langMapping = {
    'pt': 'pt-BR',
    'pt-BR': 'pt-BR',
    'en': 'en',
    'es': 'es',
    'es-419': 'es',
    'all': 'all',
    'localsourcelang': 'all'
  };
  
  const mappedLang = langMapping[providerLang] || 'all';
  
  return activeLanguages[mappedLang] === true;
}

/**
 * Filtra lista de providers pelos idiomas ativos
 */
export function filterProvidersByLanguage(providers) {
  return providers.filter(shouldShowProvider);
}
