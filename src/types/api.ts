/**
 * Tipos para todas as respostas da API
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  has_more: boolean;
  page: number;
  total_pages?: number;
  total_count?: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

/**
 * Tipos para configuração da aplicação
 */
export interface AppConfig {
  apiBaseUrl: string;
  enableCache: boolean;
  cacheTimeout: number;
  maxRetries: number;
}

/**
 * Tipos para contextos
 */
export interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export interface RemoteStorageContextType {
  connected: boolean;
  connecting?: boolean;
  error?: string;
}

export interface LanguageFilterContextType {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  changeLanguage: (language: string) => void;
  isLoading: boolean;
}

/**
 * Tipos para notificações
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}
