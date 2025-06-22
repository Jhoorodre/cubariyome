/**
 * Serviço para comunicação com a API GraphQL do Suwayomi
 */

import { API_BASE_URL } from '../config';

// Fragments GraphQL
export const SOURCE_BASE_FIELDS = `
  fragment SOURCE_BASE_FIELDS on SourceType {
    id
    name
    displayName
    __typename
  }
`;

export const SOURCE_LIST_FIELDS = `
  fragment SOURCE_LIST_FIELDS on SourceType {
    ...SOURCE_BASE_FIELDS
    lang
    iconUrl
    isNsfw
    isConfigurable
    supportsLatest
    extension {
      pkgName
      repo
      __typename
    }
    __typename
  }
`;

// Queries GraphQL
export const GET_SOURCES_LIST = `
  ${SOURCE_BASE_FIELDS}
  ${SOURCE_LIST_FIELDS}
  
  query GET_SOURCES_LIST {
    sources {
      nodes {
        ...SOURCE_LIST_FIELDS
        __typename
      }
      __typename
    }
  }
`;

// Interface para tipagem dos sources
export interface Source {
  id: string;
  name: string;
  displayName: string;
  lang: string;
  language: string; // Para compatibilidade com o código existente
  iconUrl: string;
  isNsfw: boolean;
  is_nsfw: boolean; // Para compatibilidade com o código existente
  isConfigurable: boolean;
  supportsLatest: boolean;
  extension: {
    pkgName: string;
    repo: string;
    __typename: string;
  };
  __typename: string;
}

export interface SourcesResponse {
  data: {
    sources: {
      nodes: Source[];
      __typename: string;
    };
    __typename?: string;
  };
}

/**
 * Cliente GraphQL genérico
 */
export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string = API_BASE_URL) {
    this.endpoint = endpoint;
  }

  async query<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
    try {
      console.log(`🔄 GraphQL Query enviada para ${this.endpoint}:`, {
        query: query.substring(0, 100) + '...',
        variables
      });

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error('❌ GraphQL Errors:', result.errors);
        throw new Error(`GraphQL Error: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      console.log('✅ GraphQL Response recebida:', {
        data: result.data ? 'Present' : 'Missing',
        hasErrors: !!result.errors
      });

      return result;
    } catch (error) {
      console.error('❌ Erro na query GraphQL:', error);
      throw error;
    }
  }
}

/**
 * Serviço específico para Sources
 */
export class SourcesService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient();
  }

  /**
   * Busca todas as fontes disponíveis
   */
  async getSources(): Promise<Source[]> {
    try {
      const result: SourcesResponse = await this.client.query(GET_SOURCES_LIST);
      
      if (!result.data?.sources?.nodes) {
        throw new Error('Resposta GraphQL inválida: dados de sources não encontrados');
      }

      // Transformar dados para compatibilidade com código existente
      const sources = result.data.sources.nodes.map(source => ({
        ...source,
        language: source.lang, // Mapear lang para language
        is_nsfw: source.isNsfw, // Mapear isNsfw para is_nsfw
      }));

      console.log(`📚 ${sources.length} fontes carregadas via GraphQL`);
      
      return sources;
    } catch (error) {
      console.error('❌ Erro ao buscar fontes via GraphQL:', error);
      throw error;
    }
  }
}

// Instância singleton do serviço
export const sourcesService = new SourcesService();
export const graphqlClient = new GraphQLClient();

export default SourcesService;
