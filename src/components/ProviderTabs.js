// src/components/ProviderTabs.js
import React from 'react';
import ScrollableCarousel from './ScrollableCarousel';
import ProviderIcon from './ProviderIcon';
import { classNames } from '../utils/strings';
import { getProviderDisplayName } from '../utils/providerUtils';

const ProviderTabs = React.memo(({ 
    providers, 
    currentProvider, 
    onProviderChange 
}) => {
    return (
        <div className='mb-4'>
            <ScrollableCarousel>
                {providers.map((provider) => (
                    <button
                        key={provider.id}
                        onClick={() => onProviderChange(provider.id)}
                        className={classNames(
                            "flex-shrink-0 mx-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none",
                            currentProvider === provider.id
                                ? "bg-gray-800 text-white dark:bg-gray-700"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                    >
                        <div className="flex items-center">
                            <ProviderIcon 
                                provider={provider} 
                                className="h-6 w-6 mr-2" 
                            />
                            <span>{getProviderDisplayName(provider)}</span>
                        </div>
                    </button>
                ))}
            </ScrollableCarousel>
        </div>
    );
});

ProviderTabs.displayName = 'ProviderTabs';

export default ProviderTabs;
