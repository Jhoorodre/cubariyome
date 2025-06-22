// src/components/WelcomeModal.js
import React, { useState, useEffect } from 'react';
import { XIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/solid';
import { OFFICIAL_LICENSED_PROVIDERS } from '../utils/sourceConstants';

const WelcomeModal = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verificar se é a primeira visita
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('hasSeenWelcome', 'true');
        setIsVisible(false);
    };

    const handleGoToSources = () => {
        handleClose();
        window.location.hash = '#/sources';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                                <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                    Bem-vindo ao Cubari!
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                        Para garantir uma experiência segura e legal, as <strong>fontes oficiais</strong> foram ativadas automaticamente:
                                    </p>
                                    
                                    <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                                        <div className="flex items-center mb-2">
                                            <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                Fontes Oficiais Ativadas
                                            </span>
                                        </div>
                                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                                            {OFFICIAL_LICENSED_PROVIDERS.map((provider, index) => (
                                                <li key={index} className="flex items-center">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    {provider}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                                        💡 Você pode adicionar mais fontes a qualquer momento na aba "Fontes"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleClose}
                        >
                            Entendi!
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleGoToSources}
                        >
                            Ver Fontes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
