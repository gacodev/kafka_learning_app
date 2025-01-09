'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '../LoadingSpinner';

export default function MultipleChoiceMode() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(10);
  const [showSettings, setShowSettings] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const category = searchParams.get('category') || 'all';
        const response = await fetch(
          `/api/questions/multiple-choice?category=${category}&count=${questionsCount}`
        );
        if (!response.ok) throw new Error('Error al cargar las preguntas');
        const data = await response.json();
        setQuestions(data.questions || []);
        setCategories(data.categories || []);
        setSelectedCategory(category);
        setShowSettings(data.questions?.length === 0);
        setScore({ correct: 0, total: 0 });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!showSettings) {
      fetchQuestions();
    }
  }, [searchParams, questionsCount, showSettings]);

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return; // Evitar cambios después de responder
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const isCorrect = index === parseInt(questions[currentIndex].answer);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setShowSettings(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
  };

  const handleStartPractice = () => {
    setShowSettings(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (showSettings) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Configuración de Práctica</h2>
        
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

          {/* Selector de cantidad de preguntas */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Número de preguntas
            </label>
            <select
              value={questionsCount}
              onChange={(e) => setQuestionsCount(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>5 preguntas</option>
              <option value={10}>10 preguntas</option>
              <option value={15}>15 preguntas</option>
              <option value={20}>20 preguntas</option>
              <option value={25}>25 preguntas</option>
            </select>
          </div>

          <button
            onClick={handleStartPractice}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            Comenzar Práctica
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="text-center text-gray-500">
        No se encontraron preguntas para esta categoría.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options = JSON.parse(currentQuestion.optionsData || '[]');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progreso y Puntuación */}
      <div className="mb-6 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
          <span className="text-emerald-400">
            Correctas: {score.correct}/{score.total}
          </span>
        </div>
        <button
          onClick={handleRestart}
          className="text-emerald-400 hover:text-emerald-300"
        >
          Cambiar configuración
        </button>
      </div>

      {/* Pregunta */}
      <div className="bg-slate-800 rounded-xl p-8 shadow-lg mb-6">
        <h3 className="text-xl font-bold text-white mb-6">
          {currentQuestion.title}
        </h3>
        
        <div className="text-slate-300 mb-6">
          {currentQuestion.content}
        </div>

        {/* Opciones */}
        <div className="space-y-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                selectedAnswer === null
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : selectedAnswer === index
                  ? parseInt(currentQuestion.answer) === index
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
                  : parseInt(currentQuestion.answer) === index
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        {/* Explicación */}
        {showExplanation && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h4 className="text-lg font-semibold text-emerald-400 mb-3">
              Explicación:
            </h4>
            <div className="text-slate-300">
              {currentQuestion.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Botón Siguiente */}
      {selectedAnswer !== null && currentIndex < questions.length - 1 && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Siguiente Pregunta
          </button>
        </div>
      )}

      {/* Resumen Final */}
      {selectedAnswer !== null && currentIndex === questions.length - 1 && (
        <div className="mt-8 p-6 bg-slate-800 rounded-lg text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            ¡Has completado la práctica!
          </h3>
          <p className="text-slate-300 mb-6">
            Puntuación final: {score.correct} de {score.total} ({Math.round((score.correct / score.total) * 100)}%)
          </p>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Practicar de Nuevo
          </button>
        </div>
      )}
    </div>
  );
} 