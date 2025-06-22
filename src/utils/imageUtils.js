// src/utils/imageUtils.js
import { API_BASE_URL } from '../config';

/**
 * Converte um thumbnail_url_proxy relativo em URL completo
 * @param {string} thumbnailUrlProxy - O caminho relativo retornado pelo backend
 * @returns {string} - URL completo para a imagem
 */
export function resolveImageUrl(thumbnailUrlProxy) {
  if (!thumbnailUrlProxy) return null;
  
  // Se já é um URL completo, retorna como está
  if (thumbnailUrlProxy.startsWith('http://') || thumbnailUrlProxy.startsWith('https://')) {
    return thumbnailUrlProxy;
  }
  
  // Se é um caminho relativo, combina com o API_BASE_URL
  if (thumbnailUrlProxy.startsWith('/api/v1/')) {
    // Remove o /api/v1 do início pois o API_BASE_URL já inclui
    const pathWithoutApiV1 = thumbnailUrlProxy.substring('/api/v1'.length);
    return `${API_BASE_URL}${pathWithoutApiV1}`;
  }
  
  // Se é apenas um caminho relativo simples
  if (thumbnailUrlProxy.startsWith('/')) {
    return `${API_BASE_URL}${thumbnailUrlProxy}`;
  }
  
  // Caso contrário, adiciona como está
  return `${API_BASE_URL}/${thumbnailUrlProxy}`;
}
