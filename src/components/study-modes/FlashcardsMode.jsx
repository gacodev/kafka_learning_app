'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingSpinner from '../LoadingSpinner';

export default function FlashcardsMode() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [cardsCount, setCardsCount] = useState(10);
  const [showSettings, setShowSettings] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔄 Cargando categorías iniciales...');
        const response = await fetch('/api/flashcards?category=all&count=1');
        if (!response.ok) throw new Error('Error al cargar categorías');
        const data = await response.json();
        console.log('📚 Categorías cargadas:', data.categories);
        setCategories(data.categories);
      } catch (err) {
        console.error('❌ Error cargando categorías:', err);
        setError('Error al cargar las categorías');
      }
    };

    loadCategories();
  }, []);

  const fetchFlashcards = useCallback(async (category, count) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando fetch de flashcards:', { category, count });
      
      const response = await fetch(
        `/api/flashcards?category=${category}&count=${count}`
      );
      
      console.log('📡 Estado de la respuesta:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      
      if (!data.flashcards || data.flashcards.length === 0) {
        console.log('⚠️ No se encontraron flashcards');
        setShowSettings(true);
        throw new Error('No se encontraron tarjetas para esta categoría');
      }

      console.log('✅ Flashcards cargadas exitosamente:', data.flashcards.length);
      setFlashcards(data.flashcards);
      setCategories(data.categories);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowSettings(false);
    } catch (err) {
      console.error('❌ Error en fetchFlashcards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    setSelectedCategory(category);
    
    if (!showSettings) {
      fetchFlashcards(category, cardsCount);
    }
  }, [searchParams, cardsCount, showSettings, fetchFlashcards]);

  const handleStartStudy = async () => {
    await fetchFlashcards(selectedCategory, cardsCount);
    router.push(`/flashcards?category=${selectedCategory}`);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setShowSettings(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (showSettings) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Configuración de Estudio</h2>
        
        <div className="space-y-6">
          {/* Selector de categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de cantidad de tarjetas */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Número de tarjetas
            </label>
            <select
              value={cardsCount}
              onChange={(e) => setCardsCount(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>5 tarjetas</option>
              <option value={10}>10 tarjetas</option>
              <option value={15}>15 tarjetas</option>
              <option value={20}>20 tarjetas</option>
              <option value={25}>25 tarjetas</option>
            </select>
          </div>

          <button
            onClick={handleStartStudy}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            Comenzar Estudio
          </button>
        </div>
      </div>
    );
  }

  if (!flashcards.length) {
    return (
      <div className="text-center text-gray-500">
        No se encontraron tarjetas para esta categoría.
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progreso */}
      <div className="mb-6 flex items-center justify-between text-slate-400">
        <span>
          Tarjeta {currentIndex + 1} de {flashcards.length}
        </span>
        <button
          onClick={handleRestart}
          className="text-emerald-400 hover:text-emerald-300"
        >
          Cambiar configuración
        </button>
      </div>

      {/* Tarjeta */}
      <div
        className={`bg-slate-800 rounded-xl p-8 shadow-lg cursor-pointer transition-all duration-300 transform ${
          isFlipped ? 'scale-[1.02]' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ minHeight: '300px' }}
      >
        <div className="text-center">
          {!isFlipped ? (
            <>
              <h3 className="text-xl font-bold text-emerald-400 mb-4">
                {currentCard.term}
              </h3>
              <p className="text-slate-400 text-sm">Click para ver la definición</p>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-white">{currentCard.definition}</div>
                {currentCard.example && (
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">
                      Ejemplo:
                    </h4>
                    <div className="bg-slate-900 rounded p-4 text-slate-300">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {currentCard.example}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-lg ${
            currentIndex === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className={`px-4 py-2 rounded-lg ${
            currentIndex === flashcards.length - 1
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
} 