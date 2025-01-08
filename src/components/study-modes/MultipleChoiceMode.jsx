'use client';

import { useState, useEffect } from 'react';

export default function MultipleChoiceMode({ certification }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await fetch(`/api/questions/${certification}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Error al cargar las preguntas');
        }

        // Validar la estructura de los datos
        if (!Array.isArray(data)) {
          throw new Error('Formato de datos inválido');
        }

        // Validar cada pregunta
        const validQuestions = data.filter(question => 
          question &&
          question.content &&
          Array.isArray(question.options) &&
          question.options.length > 0 &&
          typeof question.correctAnswer === 'number' &&
          question.correctAnswer >= 0 &&
          question.correctAnswer < question.options.length &&
          question.answer
        );

        if (validQuestions.length === 0) {
          throw new Error('No se encontraron preguntas válidas');
        }

        const shuffledQuestions = [...validQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [certification]);

  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return; // Prevenir cambios después de seleccionar
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-200">Cargando preguntas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-400">{error}</div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-200">No se encontraron preguntas para esta certificación.</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-400">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </div>
          <div className="flex gap-4">
            <div className="text-sm text-slate-400">
              Tema: {currentQuestion.topic}
            </div>
            <div className="text-sm text-slate-400">
              Importancia: {currentQuestion.importance}
            </div>
          </div>
        </div>

        <div className="text-lg text-slate-200 mb-6">
          {currentQuestion.content}
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                selectedAnswer === null
                  ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                  : selectedAnswer === index
                  ? index === currentQuestion.correctAnswer
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 text-white'
                  : index === currentQuestion.correctAnswer
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-600 text-slate-400'
              }`}
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>

        {selectedAnswer !== null && (
          <div className="mt-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-emerald-400 hover:text-emerald-300 mb-4"
            >
              {showExplanation ? 'Ocultar explicación' : 'Ver explicación'}
            </button>

            {showExplanation && currentQuestion.explanation && (
              <div className="bg-slate-800 rounded-lg p-4 text-slate-200">
                <h3 className="font-semibold text-emerald-400 mb-2">Explicación:</h3>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}

            <button
              onClick={handleNextQuestion}
              className="mt-4 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Siguiente pregunta' : 'Finalizar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 