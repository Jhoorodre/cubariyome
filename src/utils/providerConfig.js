// src/utils/providerConfig.js

/**
 * Configuração de providers - categoriza por estabilidade e dependências
 */

// Providers que funcionam de forma independente, sem dependências externas
export const STABLE_PROVIDERS = [
  'MANGA Plus by SHUEISHA',
  'MangaDex', 
  'Comick',
  'Cubari'
];

// Providers que dependem do Suwayomi Server para funcionar
export const SUWAYOMI_DEPENDENT_PROVIDERS = [
  'Galinha Samurai Scan',
  'Gekkou Scans',
  'Hunters Scan',
  'InfinyxScan',
  'Kakusei Project',
  'Leitor de Mangá',
  'Kami Sama Explorer',
  'Lura Toon',
  'Manga Livre',
  'Manhastro',
  'Mediocre Toons',
  'One Piece TECA',
  'Remangas',
  'Read Mangas',
  'Sagrado Império da Britannia',
  'Seita Celestial',
  'Saikai Scan',
  'Silence Scan',
  'Sussy Toons',
  'Taiyō',
  'Yushuke Mangas'
];

// Providers que podem funcionar dependendo da configuração
export const CONDITIONAL_PROVIDERS = [
  'Suwayomi' // Funciona se o servidor Suwayomi estiver rodando
];

/**
 * Verifica se um provider é estável (não depende de serviços externos)
 * @param {Object} provider - Objeto provider
 * @returns {boolean}
 */
export function isStableProvider(provider) {
  return STABLE_PROVIDERS.includes(provider.name);
}

/**
 * Verifica se um provider depende do Suwayomi
 * @param {Object} provider - Objeto provider  
 * @returns {boolean}
 */
export function isSuwayomiDependent(provider) {
  return SUWAYOMI_DEPENDENT_PROVIDERS.includes(provider.name);
}

/**
 * Filtra providers para mostrar apenas os estáveis quando há problemas
 * @param {Array} providers - Lista de providers
 * @param {boolean} forceStableOnly - Força mostrar apenas providers estáveis
 * @returns {Array}
 */
export function filterStableProviders(providers, forceStableOnly = false) {
  if (!Array.isArray(providers)) return [];
  
  if (forceStableOnly) {
    return providers.filter(isStableProvider);
  }
  
  // Por padrão, tenta usar todos, mas prioriza estáveis
  const stableProviders = providers.filter(isStableProvider);
  const otherProviders = providers.filter(p => !isStableProvider(p));
  
  return [...stableProviders, ...otherProviders];
}
