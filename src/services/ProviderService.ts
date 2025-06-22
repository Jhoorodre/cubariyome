/**
 * Serviço para gerenciamento de providers/fontes
 */
import { API_BASE_URL } from '../config';
import { ContentProvider } from '../types/sources';
import { ApiResponse } from '../types/api';
import { 
  OFFICIAL_LICENSED_PROVIDERS,
  KNOWN_SAFE_BRAZILIAN_PROVIDERS,
  PRIORITY_PROVIDERS 
} from '../utils/sourceConstants';

class ProviderService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  /**
   * Busca todos os providers disponíveis via REST API
   */
  async getProviders(): Promise<ContentProvider[]> {
    const cacheKey = 'all-providers';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }    try {
      const response = await fetch(`${API_BASE_URL}/content-providers/list/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const providers = data.providers || data;
      this.setCache(cacheKey, providers);
      
      return providers;
    } catch (error) {
      console.error('Erro ao buscar providers via REST API:', error);
      throw new Error('Falha ao carregar lista de fontes. Verifique sua conexão.');
    }
  }

  /**
   * Filtra providers por idioma
   */
  filterProvidersByLanguage(providers: ContentProvider[], language: string): ContentProvider[] {
    if (language === 'all') {
      return providers.filter(provider => {
        const lang = provider.language;
        return ['all', 'pt-BR', 'en', 'es', 'pt'].includes(lang);
      });
    }
    
    if (language === 'pt') {
      return providers.filter(provider => {
        const lang = provider.language;
        return ['pt-BR', 'pt', 'all'].includes(lang);
      });
    }
    
    return providers.filter(provider => provider.language === language);
  }

  /**
   * Remove providers duplicados priorizando idioma específico
   */
  removeDuplicateProviders(providers: ContentProvider[], preferredLanguage: string): ContentProvider[] {
    const uniqueProviders = new Map<string, ContentProvider>();
    
    providers.forEach(provider => {
      const key = provider.name;
      const existing = uniqueProviders.get(key);
      
      if (!existing) {
        uniqueProviders.set(key, provider);
      } else {
        // Lógica de priorização por idioma
        if (this.shouldReplaceProvider(existing, provider, preferredLanguage)) {
          uniqueProviders.set(key, provider);
        }
      }
    });
    
    return Array.from(uniqueProviders.values());
  }

  /**
   * Aplica ordem personalizada dos providers
   */
  applyCustomOrder(providers: ContentProvider[]): ContentProvider[] {
    try {
      const savedOrder = localStorage.getItem('enabledProvidersOrder');
      
      if (!savedOrder) {
        return this.applyDefaultPriority(providers);
      }
      
      const orderArray: string[] = JSON.parse(savedOrder);
      const orderedProviders: ContentProvider[] = [];
      const unorderedProviders: ContentProvider[] = [];
      
      // Adicionar providers na ordem personalizada
      orderArray.forEach(providerName => {
        const provider = providers.find(p => p.name === providerName);
        if (provider) {
          orderedProviders.push(provider);
        }
      });
      
      // Adicionar providers não ordenados
      providers.forEach(provider => {
        if (!orderArray.includes(provider.name)) {
          unorderedProviders.push(provider);
        }
      });
      
      return [...orderedProviders, ...unorderedProviders];
    } catch (error) {
      console.warn('Erro ao aplicar ordem personalizada:', error);
      return this.applyDefaultPriority(providers);
    }
  }

  /**
   * Categoriza providers
   */
  categorizeProvider(provider: ContentProvider): 'official' | 'brazilian' | 'international' | 'nsfw' {
    if (provider.is_nsfw) return 'nsfw';
    if (OFFICIAL_LICENSED_PROVIDERS.includes(provider.name)) return 'official';
    if (KNOWN_SAFE_BRAZILIAN_PROVIDERS.includes(provider.name) || 
        ['pt', 'pt-BR'].includes(provider.language)) return 'brazilian';
    return 'international';
  }

  /**
   * Verifica se um provider está habilitado
   */
  isProviderEnabled(providerName: string): boolean {
    const enabledProviders = JSON.parse(localStorage.getItem('enabledProviders') || '[]');
    return enabledProviders.includes(providerName);
  }

  /**
   * Habilita/desabilita um provider
   */
  toggleProvider(providerName: string, enabled: boolean): void {
    const enabledProviders = JSON.parse(localStorage.getItem('enabledProviders') || '[]');
    
    if (enabled && !enabledProviders.includes(providerName)) {
      enabledProviders.push(providerName);
    } else if (!enabled) {
      const index = enabledProviders.indexOf(providerName);
      if (index > -1) {
        enabledProviders.splice(index, 1);
      }
    }
    
    localStorage.setItem('enabledProviders', JSON.stringify(enabledProviders));
    
    // Disparar evento para notificar mudanças
    window.dispatchEvent(new CustomEvent('providersChanged', {
      detail: { enabledProviders }
    }));
  }

  // Métodos privados
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private shouldReplaceProvider(existing: ContentProvider, candidate: ContentProvider, preferredLanguage: string): boolean {
    if (preferredLanguage === 'pt') {
      if (existing.language === 'all' && ['pt-BR', 'pt'].includes(candidate.language)) {
        return true;
      }
      if (existing.language === 'pt' && candidate.language === 'pt-BR') {
        return true;
      }
    } else {
      if (existing.language === 'all' && candidate.language !== 'all') {
        return true;
      }
    }
    return false;
  }

  private applyDefaultPriority(providers: ContentProvider[]): ContentProvider[] {
    const priorityMap = new Map(PRIORITY_PROVIDERS.map((name, index) => [name, index]));
    
    return providers.sort((a, b) => {
      const aPriority = priorityMap.get(a.name) ?? 999;
      const bPriority = priorityMap.get(b.name) ?? 999;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Se mesmo prioridade, ordenar alfabeticamente
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const providerService = new ProviderService();
