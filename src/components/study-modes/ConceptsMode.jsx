'use client';

import { useState, useEffect } from 'react';

export default function ConceptsMode({ certification }) {
  const [questions, setQuestions] = useState({});
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showAnswer, setShowAnswer] = useState({});
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

        if (!Array.isArray(data)) {
          throw new Error('Formato de datos inválido');
        }

        // Validar y filtrar preguntas inválidas
        const validQuestions = data.filter(q => 
          q && 
          typeof q.content === 'string' && 
          Array.isArray(q.options) && 
          q.options.length > 0 &&
          typeof q.correctAnswer === 'number' &&
          q.correctAnswer >= 0 &&
          q.correctAnswer < q.options.length
        );

        if (validQuestions.length === 0) {
          throw new Error('No se encontraron preguntas válidas');
        }

        // Agrupar preguntas por tema
        const grouped = validQuestions.reduce((acc, question) => {
          const topic = question.topic || 'General';
          if (!acc[topic]) {
            acc[topic] = [];
          }
          acc[topic].push(question);
          return acc;
        }, {});

        setQuestions(grouped);
        if (!currentTopic && Object.keys(grouped).length > 0) {
          setCurrentTopic(Object.keys(grouped)[0]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [certification, currentTopic]);

  const toggleAnswer = (questionId) => {
    setShowAnswer(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-200">Cargando conceptos...</div>
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

  if (!questions || Object.keys(questions).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-200">No se encontraron preguntas para esta certificación.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.keys(questions).map((topic) => (
          <button
            key={topic}
            onClick={() => setCurrentTopic(topic)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentTopic === topic
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {currentTopic && questions[currentTopic].map((question) => (
          <div
            key={question.id}
            className="bg-slate-700 rounded-lg overflow-hidden shadow-sm"
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => toggleAnswer(question.id)}
            >
              <div className="flex justify-between items-start">
                <div className="text-lg font-medium text-slate-200 pr-8">{question.content}</div>
                <div className="text-2xl text-slate-400">
                  {showAnswer[question.id] ? '−' : '+'}
                </div>
              </div>
              
              {showAnswer[question.id] && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-emerald-400 mb-2">Respuesta Correcta:</h4>
                      <p className="bg-slate-800 text-slate-200 p-3 rounded-lg">
                        {question.options[question.correctAnswer]}
                      </p>
                    </div>
                    {question.explanation && (
                      <div>
                        <h4 className="font-semibold text-emerald-400 mb-2">Explicación:</h4>
                        <p className="bg-slate-800 text-slate-200 p-3 rounded-lg">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 