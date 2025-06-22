// src/components/FilterPanel.js
import React from 'react';
import { SpinIcon } from './Spinner';

const FilterPanel = ({ isOpen, isLoading, filters, selectedFilters, onFilterChange, onApply, onClose }) => {
    if (!isOpen) return null;
    const hasFilters = filters && filters.length > 0;

    const renderFilterInput = (filter, groupName) => {
        if (!filter || !filter.type || !filter.name) return null;
        const filterId = `${groupName}-${filter.name}`;
        switch (filter.type) {
            case 'CheckBoxFilter':
                return (
                    <div key={filterId} className="flex items-center">
                        <input
                            type="checkbox"
                            id={filterId}
                            checked={!!selectedFilters[filter.name]}
                            onChange={(e) => onFilterChange(filter.name, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor={filterId} className="ml-2 text-sm text-gray-900 dark:text-gray-300">{filter.name}</label>
                    </div>
                );
            case 'SelectFilter':
                return (
                    <div key={filterId} className="flex flex-col">
                        <label htmlFor={filterId} className="text-sm text-gray-900 dark:text-gray-300 mb-1">{filter.name}</label>
                        <select
                            id={filterId}
                            value={selectedFilters[filter.name] || ''}
                            onChange={e => onFilterChange(filter.name, e.target.value)}
                            className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
                        >
                            <option value="">Selecione...</option>
                            {(filter.values || []).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            {isLoading ? (
                <div className="flex justify-center items-center p-4">
                    <SpinIcon className="w-6 h-6" />
                    <span className="ml-2">Carregando filtros...</span>
                </div>
            ) : hasFilters ? (
                <>
                    <div className="space-y-4">
                        {(filters || []).map((group, index) => {
                            if (group.type === 'GroupFilter') {
                                return (
                                    <div key={`${group.name}-${index}`}>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{group.name}</h4>
                                        <div className="pl-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {(group.filters || []).map(filter => renderFilterInput(filter, group.name))}
                                        </div>
                                    </div>
                                );
                            }
                            return renderFilterInput(group, 'top-level');
                        })}
                    </div>
                    <div className="flex justify-end space-x-4 mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <button onClick={onClose} className="px-4 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                        <button onClick={onApply} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Aplicar Filtros</button>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500">
                    Esta fonte não suporta filtros avançados.
                </p>
            )}
        </div>
    );
};

export default FilterPanel;
