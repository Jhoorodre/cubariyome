// src/components/FilterModal.js
import React from 'react';

const FilterModal = ({ isOpen, onClose, filters, selectedFilters, onFilterChange, onApply }) => {
    if (!isOpen) return null;

    const renderFilter = (filter) => {
        switch (filter.type) {
            case 'CheckBoxFilter':
                return (
                    <div key={filter.name} className="flex items-center">
                        <input
                            type="checkbox"
                            id={filter.name}
                            checked={!!selectedFilters[filter.name]}
                            onChange={(e) => onFilterChange(filter.name, e.target.checked)}
                        />
                        <label htmlFor={filter.name} className="ml-2">{filter.name}</label>
                    </div>
                );
            case 'SelectFilter':
                return (
                    <div key={filter.name}>
                        <label className="block mb-1">{filter.name}</label>
                        <select
                            value={selectedFilters[filter.name] || ''}
                            onChange={(e) => onFilterChange(filter.name, e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Todos</option>
                            {filter.values.map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Filtros</h2>
                <div className="space-y-4">
                    {filters.map(group => (
                        <div key={group.name}>
                            <h3 className="font-semibold">{group.name}</h3>
                            <div className="pl-2 mt-2 space-y-2">
                                {group.filters.map(renderFilter)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded">Cancelar</button>
                    <button onClick={onApply} className="px-4 py-2 bg-blue-600 text-white rounded">Aplicar Filtros</button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
