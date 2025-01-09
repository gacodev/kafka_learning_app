'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function ConceptSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Solo buscar si hay 2+ caracteres o está vacío
    if (value.trim().length >= 2 || value.trim() === '') {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Buscar conceptos..."
          className="w-full px-4 py-2 pl-10 pr-10 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
} 