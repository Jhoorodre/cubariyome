/**
 * Define a estrutura de um Provedor de Conteúdo (Fonte)
 * como retornado pelo endpoint: GET /api/v1/content-providers/list
 */
export interface ContentProvider {
  id: string;
  name: string;
  language: string;
  icon_url_proxy: string;
  is_nsfw: boolean;
  type: string;
}

/**
 * Define a estrutura de um item de conteúdo (Mangá) em uma lista de resultados,
 * como retornado pelo endpoint: GET /api/v1/content-discovery/search
 */
export interface ContentSearchResult {
  provider_id: string;
  content_id: string;
  title: string;
  thumbnail_url_proxy: string;
  // Outros campos opcionais que sua API de busca possa retornar
  author?: string;
  status?: string;
}

/**
 * Define a estrutura da resposta completa da API de busca.
 */
export interface SearchResponse {
  results: ContentSearchResult[];
  has_more: boolean;
}

/**
 * Define a estrutura de um Capítulo na lista de detalhes de um mangá.
 */
export interface ChapterInfo {
  id: string;
  name: string;
  chapter_number: number;
  scanlator: string;
  uploaded_at: string; // Formato de data ISO (ex: "2023-10-26T10:00:00Z")
}

/**
 * Define a estrutura detalhada de um item de conteúdo (Mangá),
 * como retornado pelo endpoint: GET /api/v1/content/item/.../detail/
 */
export interface ContentDetails extends ContentSearchResult {
  description: string;
  genres: string[];
  artist: string;
  url_suwayomi: string; // A URL original do mangá na fonte
  chapters: ChapterInfo[];
}

/**
 * Define a estrutura de uma única página de um capítulo.
 */
export interface ChapterPage {
  page_index: number;
  proxy_image_url: string;
}

/**
 * Define a estrutura da resposta da API que retorna as páginas de um capítulo,
 * como retornado pelo endpoint: GET /api/v1/content/item/.../chapter/.../pages/
 */
export interface ChapterPagesResponse {
  pages: ChapterPage[];
}
