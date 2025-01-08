'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 10
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentQuality = searchParams.get('quality') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentCategory) {
      fetchQuestions();
    }
  }, [currentCategory, currentQuality, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST'
      });
      const data = await response.json();
      setCategories(data);
      
      // Si no hay categoría seleccionada y hay categorías disponibles,
      // seleccionar la primera por defecto
      if (!currentCategory && data.length > 0) {
        handleCategoryChange(data[0].name);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error al cargar las categorías');
    }
  };

  const fetchQuestions = async () => {
    if (!currentCategory) return;
    
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        quality: currentQuality,
        page: currentPage.toString(),
        limit: '10'
      });

      const response = await fetch(`/api/questions/${currentCategory}?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar las preguntas');
      }

      setQuestions(data.questions);
      setPagination(data.pagination);
      setStats(data.stats);
      setError(null);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleQualityChange = (quality) => {
    const params = new URLSearchParams(searchParams);
    if (quality) {
      params.set('quality', quality);
    } else {
      params.delete('quality');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name} ({cat._count.questions})
            </option>
          ))}
        </select>

        <select
          value={currentQuality}
          onChange={(e) => handleQualityChange(e.target.value)}
          className="p-2 border rounded"
          disabled={!currentCategory}
        >
          <option value="">Todas las calidades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
          <option value="incomplete">Incompleta</option>
        </select>
      </div>

      {/* Estadísticas */}
      {currentCategory && stats && Object.keys(stats).length > 0 && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          {Object.entries(stats).map(([quality, count]) => (
            <div key={quality} className="p-4 bg-gray-100 rounded">
              <div className="font-bold">{quality}</div>
              <div>{count._count} preguntas</div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de preguntas */}
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : currentCategory ? (
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="border p-4 rounded">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">
                  Categoría: {question.categoryRel.name}
                </span>
                <span className="text-sm text-gray-500">
                  Calidad: {question.qualityLevel}
                </span>
              </div>
              <h3 className="font-bold mb-2">{question.title}</h3>
              <p className="mb-4">{question.content}</p>
              <div className="space-y-2">
                {question.questionOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`p-2 rounded ${
                      option.isCorrect ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {option.text}
                    {option.isCorrect && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </div>
                ))}
              </div>
              {question.explanation && (
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <strong>Explicación:</strong>
                  <p>{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Selecciona una categoría para ver las preguntas
        </div>
      )}

      {/* Paginación */}
      {currentCategory && pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded ${
                page === currentPage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 