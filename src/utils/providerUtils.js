// src/utils/providerUtils.js
import { KNOWN_SAFE_BRAZILIAN_PROVIDERS, OFFICIAL_LICENSED_PROVIDERS } from './sourceConstants';

/**
 * Cria um nome limpo para um provider (sem idioma)
 */
export function getProviderDisplayName(provider) {
  if (!provider?.name) return 'Provider Desconhecido';
  return provider.name;
}

/**
 * Verifica se um provider é brasileiro
 */
export function isBrazilianProvider(provider) {
  if (!provider) return false;
  
  return provider.language === 'pt' || 
         provider.language === 'pt-BR' || 
         provider.name.includes('Brasil') || 
         provider.name.includes('BR') ||
         KNOWN_SAFE_BRAZILIAN_PROVIDERS.includes(provider.name);
}

/**
 * Verifica se um provider é oficial/licenciado
 */
export function isOfficialProvider(provider) {
  if (!provider) return false;
  
  return OFFICIAL_LICENSED_PROVIDERS.some(officialName => 
    provider.name.includes(officialName) || 
    officialName.includes(provider.name)
  );
}

/**
 * Categoriza um provider
 */
export function categorizeProvider(provider) {
  if (!provider) return 'unknown';
  
  if (isOfficialProvider(provider)) return 'official';
  if (provider.is_nsfw) return 'nsfw';
  if (isBrazilianProvider(provider)) return 'brazilian';
  return 'international';
}

/**
 * Aplica a ordem personalizada dos providers salvos pelo usuário
 */
export function applyCustomProviderOrder(providers) {
  try {
    const savedOrder = localStorage.getItem('enabledProvidersOrder');
    
    if (!savedOrder) {
      return providers;
    }
    
    const orderArray = JSON.parse(savedOrder);
    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      return providers;
    }
    
    // Separar providers ordenados dos não ordenados
    const orderedProviders = [];
    const unorderedProviders = [];
    
    // Primeiro, adicionar providers na ordem personalizada
    orderArray.forEach(providerName => {
      const provider = providers.find(p => p.name === providerName);
      if (provider) {
        orderedProviders.push(provider);
      }
    });
    
    // Depois, adicionar providers que não estão na ordem personalizada
    providers.forEach(provider => {
      if (!orderArray.includes(provider.name)) {
        unorderedProviders.push(provider);
      }
    });
    
    return [...orderedProviders, ...unorderedProviders];
    
  } catch (error) {
    console.warn('Erro ao aplicar ordem personalizada dos providers:', error);
    return providers;
  }
}

/**
 * Filtra providers por preferências do usuário
 */
export function filterProvidersByPreferences(providers, preferences = {}) {
  const {
    enabledProviders = new Set(),
    officialOnly = false,
    includeNSFW = false,
    language = 'all'
  } = preferences;

  return providers.filter(provider => {
    // Verificar se está habilitado
    if (enabledProviders.size > 0 && !enabledProviders.has(provider.name)) {
      return false;
    }

    // Verificar modo apenas oficiais
    if (officialOnly && !isOfficialProvider(provider)) {
      return false;
    }

    // Verificar NSFW
    if (!includeNSFW && provider.is_nsfw) {
      return false;
    }

    // Verificar idioma
    if (language !== 'all') {
      if (language === 'pt') {
        return provider.language === 'pt' || provider.language === 'pt-BR';
      }
      return provider.language === language;
    }

    return true;
  });
}