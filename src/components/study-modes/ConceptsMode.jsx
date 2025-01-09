'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '../LoadingSpinner';

export default function ConceptsMode() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        setLoading(true);
        const category = searchParams.get('category') || 'all';
        const response = await fetch(`/api/concepts${category !== 'all' ? `?category=${category}` : ''}`);
        if (!response.ok) throw new Error('Error al cargar los conceptos');
        const data = await response.json();
        setConcepts(data.concepts || []);
        setCategories(data.categories || []);
        setSelectedCategory(category);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConcepts();
  }, [searchParams]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!concepts.length) return <div className="text-gray-500">No se encontraron conceptos.</div>;

  return (
    <div className="space-y-6">
      {/* Selector de categoría */}
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => {
            const url = new URL(window.location);
            if (e.target.value === 'all') {
              url.searchParams.delete('category');
            } else {
              url.searchParams.set('category', e.target.value);
            }
            window.history.pushState({}, '', url);
            setSelectedCategory(e.target.value);
          }}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de conceptos */}
      <div className="grid gap-6">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className="bg-slate-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Término */}
            <h3 className="text-xl font-bold text-emerald-400 mb-3">
              {concept.term}
            </h3>

            {/* Definición */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-400 mb-2">
                Definición:
              </h4>
              <p className="text-slate-200 leading-relaxed">
                {concept.definition}
              </p>
            </div>

            {/* Ejemplo (si existe) */}
            {concept.example && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">
                  Ejemplo:
                </h4>
                <div className="bg-slate-900 rounded p-4 text-slate-300">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {concept.example}
                  </pre>
                </div>
              </div>
            )}

            {/* Categoría */}
            <div className="mt-4 flex items-center">
              <span className="text-xs text-slate-500">
                Categoría: {concept.category?.name || 'Sin categoría'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 