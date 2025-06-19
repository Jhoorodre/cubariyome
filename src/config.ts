/**
 * Este arquivo centraliza as configurações principais da aplicação.
 * Mudar um valor aqui irá refletir em todo o projeto.
 */

// A URL base para o nosso backend/API Gateway (Django).
// Usar uma variável de ambiente (REACT_APP_API_URL) é a melhor prática.
// O valor 'fallback' aponta para o proxy local que o Create React App oferece.
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Adicionando a exportação de SUWAYOMI_SERVER que estava faltando
export const SUWAYOMI_SERVER = API_BASE_URL;
