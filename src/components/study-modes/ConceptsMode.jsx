'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import ConceptSearch from '../ConceptSearch';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function ConceptsMode() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total: 0,
    pages: 1,
    perPage: 8
  });

  // Cargar conceptos iniciales
  useEffect(() => {
    loadConcepts();
  }, []);

  const loadConcepts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/concepts?page=${page}&limit=8&search=${search}`);
      if (!response.ok) throw new Error('Error al cargar los conceptos');
      const data = await response.json();
      setConcepts(data.concepts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    await loadConcepts(1, term);
  };

  const handlePageChange = async (page) => {
    await loadConcepts(page, searchTerm);
  };

  if (loading && concepts.length === 0) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <ConceptSearch onSearch={handleSearch} />
      
      {concepts.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          No se encontraron conceptos que coincidan con tu búsqueda.
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {concepts.map((concept) => (
              <div
                key={concept.id}
                className="bg-slate-800 rounded-lg p-6 space-y-4"
              >
                <h3 className="text-xl font-bold text-emerald-400">
                  {concept.term}
                </h3>
                <div className="text-slate-300">
                  {concept.definition}
                </div>
                {concept.example && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">
                      Ejemplo:
                    </h4>
                    <div className="bg-slate-900 rounded p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300">
                        {concept.example}
                      </pre>
                    </div>
                  </div>
                )}
                {concept.category && (
                  <div className="mt-4 flex items-center">
                    <span className="text-sm text-slate-400">
                      Categoría: {concept.category.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-slate-400">
                Página {pagination.currentPage} de {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.pages}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 