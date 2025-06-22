// src/utils/languageUtils.js
/**
 * Utilidades para gerenciamento de idiomas dos providers
 */

// Idiomas permitidos no sistema
export const ALLOWED_LANGUAGES = ['pt', 'en', 'es', 'all'];

// Mapeamento de códigos de idioma para nomes amigáveis
export const LANGUAGE_DISPLAY_NAMES = {
  'pt': 'Português',
  'en': 'English',
  'es': 'Español',
  'all': 'Todos'
};

// Prioridade dos idiomas (pt-BR é prioridade)
export const LANGUAGE_PRIORITY = {
  'pt': 1,
  'en': 2,
  'es': 3,
  'all': 4
};

/**
 * Normaliza códigos de idioma para o formato padrão
 * @param {string} language - Código do idioma (ex: 'pt-BR', 'en-US', 'pt', 'en')
 * @returns {string} Código normalizado
 */
export function normalizeLanguageCode(language) {
  if (!language) return null;
  
  const lang = language.toLowerCase();
  
  // Mapeia variações para códigos padronizados
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('es')) return 'es';
  if (lang === 'all' || lang === 'global') return 'all';
  
  return lang;
}

/**
 * Verifica se um idioma é permitido no sistema
 * @param {string} language - Código do idioma
 * @returns {boolean}
 */
export function isLanguageAllowed(language) {
  const normalized = normalizeLanguageCode(language);
  return ALLOWED_LANGUAGES.includes(normalized);
}

/**
 * Filtra providers por idiomas permitidos
 * @param {Array} providers - Lista de providers
 * @returns {Array} Providers filtrados
 */
export function filterProvidersByAllowedLanguages(providers) {
  if (!Array.isArray(providers)) return [];
  
  return providers.filter(provider => {
    const lang = provider.language || provider.lang;
    return isLanguageAllowed(lang);
  });
}

/**
 * Ordena providers por prioridade de idioma
 * @param {Array} providers - Lista de providers
 * @returns {Array} Providers ordenados
 */
export function sortProvidersByLanguagePriority(providers) {
  if (!Array.isArray(providers)) return [];
  
  return [...providers].sort((a, b) => {
    const langA = normalizeLanguageCode(a.language || a.lang);
    const langB = normalizeLanguageCode(b.language || b.lang);
    
    const priorityA = LANGUAGE_PRIORITY[langA] || 999;
    const priorityB = LANGUAGE_PRIORITY[langB] || 999;
    
    return priorityA - priorityB;
  });
}

/**
 * Filtra providers por idioma selecionado
 * @param {Array} providers - Lista de providers
 * @param {string} selectedLanguage - Idioma selecionado ('all' para todos)
 * @returns {Array} Providers filtrados
 */
export function filterProvidersBySelectedLanguage(providers, selectedLanguage) {
  if (!Array.isArray(providers)) {
    console.log('filterProvidersBySelectedLanguage: providers não é um array');
    return [];
  }
  
  console.log('filterProvidersBySelectedLanguage - Input:', {
    providersCount: providers.length,
    selectedLanguage,
    sampleProviders: providers.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      language: p.language,
      lang: p.lang
    }))
  });
  
  // Se 'all' está selecionado, retorna todos os providers permitidos
  if (selectedLanguage === 'all') {
    const result = filterProvidersByAllowedLanguages(providers);
    console.log('filterProvidersBySelectedLanguage - Resultado para "all":', result.length);
    return result;
  }
  
  // Filtra primeiro pelos idiomas permitidos, depois pelo idioma selecionado
  const allowedProviders = filterProvidersByAllowedLanguages(providers);
  console.log('Providers permitidos após filtro inicial:', allowedProviders.length);
  
  const result = allowedProviders.filter(provider => {
    const lang = normalizeLanguageCode(provider.language || provider.lang);
    const matches = lang === selectedLanguage;
    if (!matches) {
      console.log(`Provider ${provider.name} (${provider.language || provider.lang} -> ${lang}) não corresponde a ${selectedLanguage}`);
    }
    return matches;
  });
  
  console.log('filterProvidersBySelectedLanguage - Resultado final:', result.length);
  return result;
}

/**
 * Obtém o nome amigável de um idioma
 * @param {string} language - Código do idioma
 * @returns {string} Nome amigável
 */
export function getLanguageDisplayName(language) {
  return LANGUAGE_DISPLAY_NAMES[language] || language;
}

/**
 * Obtém o idioma padrão do sistema
 * @returns {string} Código do idioma padrão
 */
export function getDefaultLanguage() {
  return 'all'; // Todos os idiomas como padrão
}

/**
 * Salva a preferência de idioma no localStorage
 * @param {string} language - Código do idioma
 */
export function saveLanguagePreference(language) {
  try {
    localStorage.setItem('cubari_preferred_language', language);
  } catch (error) {
    console.warn('Erro ao salvar preferência de idioma:', error);
  }
}

/**
 * Carrega a preferência de idioma do localStorage
 * @returns {string} Código do idioma salvo ou idioma padrão
 */
export function loadLanguagePreference() {
  try {
    const saved = localStorage.getItem('cubari_preferred_language');
    return saved && isLanguageAllowed(saved) ? saved : getDefaultLanguage();
  } catch (error) {
    console.warn('Erro ao carregar preferência de idioma:', error);
    return getDefaultLanguage();
  }
}
