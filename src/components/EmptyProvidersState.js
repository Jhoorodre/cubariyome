// src/components/EmptyProvidersState.js
import React from 'react';
import { AdjustmentsIcon } from '@heroicons/react/solid';
import Container from './Container';

const EmptyProvidersState = React.memo(() => {
    return (
        <Container>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                    <AdjustmentsIcon className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    ⚙️ Configure suas Fontes
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Nenhuma fonte de mangá está habilitada no momento.
                    Configure suas preferências para começar a explorar.
                </p>
                
                <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-700 dark:text-gray-300">Vá para a aba <strong>Fontes</strong></span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-gray-700 dark:text-gray-300">Escolha seus provedores preferidos</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span className="text-gray-700 dark:text-gray-300">Volte aqui e explore os mangás</span>
                    </div>
                </div>
                
                <button
                    onClick={() => window.location.hash = '#/sources'}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                    <AdjustmentsIcon className="w-5 h-5 mr-2" />
                    Configurar Fontes
                </button>
            </div>
        </Container>
    );
});

EmptyProvidersState.displayName = 'EmptyProvidersState';

export default EmptyProvidersState;
