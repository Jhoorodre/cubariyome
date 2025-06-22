// src/components/LanguageSelector.js
import React from 'react';
import { useLanguageFilter } from '../context/LanguageFilterContext';
import { 
  ALLOWED_LANGUAGES, 
  getLanguageDisplayName 
} from '../utils/languageUtils';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { t } = useTranslation();
  const { selectedLanguage, changeLanguage, isLoading } = useLanguageFilter();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('settings.language.loading')}
        </label>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('settings.language.title')}
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t('settings.language.description')}
      </p>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ALLOWED_LANGUAGES.map((language) => (
          <button
            key={language}
            onClick={() => changeLanguage(language)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
              border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${
                selectedLanguage === language
                  ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }
            `}
          >
            {getLanguageDisplayName(language)}
          </button>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <strong>{t('settings.language.currentSelection')}:</strong> {getLanguageDisplayName(selectedLanguage)}
        </p>
      </div>
    </div>
  );
}

export default LanguageSelector;
