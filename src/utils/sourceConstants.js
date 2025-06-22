// src/utils/sourceConstants.js
// Constantes compartilhadas para gerenciamento de fontes

// Lista de fontes oficiais/licenciadas
export const OFFICIAL_LICENSED_PROVIDERS = [
    'MANGA Plus by SHUEISHA',
    'MANGA Plus Creators by SHUEISHA',
    'Comikey',
    'Comikey Brasil',
    'MangaToon (Limited)',
    'Webtoons.com Translations'
];

// Lista de providers brasileiros conhecidos que são seguros
// (alguns podem estar marcados incorretamente como NSFW)
export const KNOWN_SAFE_BRAZILIAN_PROVIDERS = [
    // === FONTES BRASILEIRAS CONFIRMADAS ===
    'Galinha Samurai Scan',
    'Gekkou Scans', 
    'Hunters Scan',
    'Kakusei Project',
    'Leitor de Mangá',
    'Leitor de MangÃ¡', // Versão com encoding diferente
    'Kami Sama Explorer',
    'Manga Livre',
    'One Piece TECA',
    'Remangas',
    'Read Mangas',
    'Silence Scan',
    'Taiyō',
    'TaiyÅ', // Versão com encoding diferente
    'InfinyxScan',
    'Lura Toon',
    'Manhastro',
    'Mediocre Toons',
    'Saikai Scan',
    'Seita Celestial',
    'Sagrado ImpÃ©rio da Britannia',
    'Sussy Toons',
    'Yushuke Mangas',
    'Arthur Scan',
    'Argos Comics',
    'Argos Scan',
    'Aurora Scan',
    'Boruto Explorer',
    'Crystal Comics',
    'Dango Scan',
    'Diskus Scan',
    'Dream Scan',
    'FÃªnix Manhwas',
    'GALAX Scans',
    'Hianato Scan',
    'Alone Scanlator',
    'NineMangaBr',
    'Cerise Scan',
    'Coven Scan',
    'Euphoria Scan',
    'Ghost Scan'
];

// Lista de providers internacionais populares
export const POPULAR_INTERNATIONAL_PROVIDERS = [
    'MangaDex',
    'Comick',
    'MANGA Plus',
    'MANGA Plus by SHUEISHA',
    'Comikey',
    'MangaFire',
    'MangaPark',
    'MangaReader',
    'Cubari',
    'Suwayomi'
];

// Providers prioritários para carregamento inicial no Discover
export const PRIORITY_PROVIDERS = [
    'MANGA Plus by SHUEISHA',
    'MangaDx',
    'Comick',
    'Galinha Samurai Scan',
    'InfinyxScan',
    'Hunters Scan'
];

// Providers brasileiros adicionais para quando há poucas fontes prioritárias
export const ADDITIONAL_BRAZILIAN_PROVIDERS = [
    'Manga Livre',
    'Kakusei Project',
    'Leitor de Mangá',
    'Saikai Scan',
    'Yushuke Mangas'
];

// Função utilitária para verificar se um provider é brasileiro
export const isBrazilianProvider = (provider) => {
    if (!provider) return false;
    
    return provider.language === 'pt' || 
           provider.language === 'pt-BR' ||           provider.name.includes('Brasil') || 
           provider.name.includes('BR') ||
           KNOWN_SAFE_BRAZILIAN_PROVIDERS.includes(provider.name);
};

// Função utilitária para verificar se um provider é oficial
export const isOfficialProvider = (provider) => {
    if (!provider) return false;
    
    return OFFICIAL_LICENSED_PROVIDERS.some(officialName => 
        provider.name.includes(officialName) || 
        officialName.includes(provider.name)
    );
};

// Função para categorizar providers
export const categorizeProvider = (provider) => {
    if (!provider) return 'unknown';
    
    if (isOfficialProvider(provider)) return 'official';
    if (provider.is_nsfw) return 'nsfw';
    if (isBrazilianProvider(provider)) return 'brazilian';
    return 'international';
};

// Função para obter providers prioritários baseado no idioma
export const getPriorityProvidersByLanguage = (language = 'pt') => {
    const priorityMap = {
        'pt': ['MANGA Plus by SHUEISHA', 'Galinha Samurai Scan', 'InfinyxScan', 'Hunters Scan'],
        'pt-BR': ['MANGA Plus by SHUEISHA', 'Galinha Samurai Scan', 'InfinyxScan', 'Hunters Scan'],
        'en': ['MANGA Plus by SHUEISHA', 'MangaDex', 'Comick', 'MangaFire'],
        'es': ['MANGA Plus by SHUEISHA', 'MangaDex', 'LectorManga'],
        'all': ['MANGA Plus by SHUEISHA', 'MangaDex', 'Galinha Samurai Scan', 'Comick']
    };
    
    return priorityMap[language] || priorityMap['all'];
};
