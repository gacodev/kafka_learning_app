'use client';

import { useState, useEffect } from 'react';

export default function ConceptsMode({ certification }) {
  const [questions, setQuestions] = useState({});
  const [currentTopic, setCurrentTopic] = useState(null);
  const [showAnswer, setShowAnswer] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [studyProgress, setStudyProgress] = useState({});
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

        // Asegurarse de que data.questions existe y es un array
        if (!data.questions || !Array.isArray(data.questions)) {
          throw new Error('Formato de datos inválido');
        }

        // Agrupar preguntas por tema
        const grouped = data.questions.reduce((acc, question) => {
          const topic = question.categoryRel?.name || 'General';
          if (!acc[topic]) {
            acc[topic] = [];
          }
          acc[topic].push({
            id: question.id,
            content: question.content,
            answer: question.optionsData, // Asumiendo que es un string JSON
            explanation: question.explanation,
            category: question.categoryRel?.name || 'General'
          });
          return acc;
        }, {});

        setQuestions(grouped);
        if (!currentTopic && Object.keys(grouped).length > 0) {
          setCurrentTopic(Object.keys(grouped)[0]);
        }

        // Cargar progreso guardado
        const savedProgress = localStorage.getItem('studyProgress');
        if (savedProgress) {
          setStudyProgress(JSON.parse(savedProgress));
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

  const handleUserAnswer = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const checkAnswer = (questionId, question) => {
    const userAnswer = userAnswers[questionId];
    const isCorrect = userAnswer === question.answer;
    
    // Actualizar feedback
    setFeedback(prev => ({
      ...prev,
      [questionId]: {
        isCorrect,
        message: isCorrect ? '¡Correcto!' : 'Intenta de nuevo'
      }
    }));

    // Actualizar progreso
    const newProgress = {
      ...studyProgress,
      [questionId]: {
        lastAttempt: new Date().toISOString(),
        attempts: (studyProgress[questionId]?.attempts || 0) + 1,
        correct: isCorrect
      }
    };
    setStudyProgress(newProgress);
    localStorage.setItem('studyProgress', JSON.stringify(newProgress));

    // Mostrar respuesta después de intentar
    setShowAnswer(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  const getQuestionStatus = (questionId) => {
    const progress = studyProgress[questionId];
    if (!progress) return 'new';
    if (progress.correct) return 'mastered';
    if (progress.attempts > 2) return 'needs-review';
    return 'learning';
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

  return (
    <div className="space-y-6">
      {/* Navegación de temas */}
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
            <span className="ml-2 text-sm opacity-80">
              ({questions[topic].length})
            </span>
          </button>
        ))}
      </div>

      {/* Progreso del tema */}
      {currentTopic && (
        <div className="bg-slate-700 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            Progreso en {currentTopic}
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-emerald-600/20 p-2 rounded">
              <div className="text-emerald-400 font-bold">
                {questions[currentTopic].filter(q => 
                  getQuestionStatus(q.id) === 'mastered'
                ).length}
              </div>
              <div className="text-sm text-slate-300">Dominados</div>
            </div>
            <div className="bg-yellow-600/20 p-2 rounded">
              <div className="text-yellow-400 font-bold">
                {questions[currentTopic].filter(q => 
                  getQuestionStatus(q.id) === 'learning'
                ).length}
              </div>
              <div className="text-sm text-slate-300">Aprendiendo</div>
            </div>
            <div className="bg-red-600/20 p-2 rounded">
              <div className="text-red-400 font-bold">
                {questions[currentTopic].filter(q => 
                  getQuestionStatus(q.id) === 'needs-review'
                ).length}
              </div>
              <div className="text-sm text-slate-300">Necesita Repaso</div>
            </div>
            <div className="bg-blue-600/20 p-2 rounded">
              <div className="text-blue-400 font-bold">
                {questions[currentTopic].filter(q => 
                  getQuestionStatus(q.id) === 'new'
                ).length}
              </div>
              <div className="text-sm text-slate-300">Nuevos</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de conceptos */}
      <div className="space-y-6">
        {currentTopic && questions[currentTopic].map((question) => {
          const status = getQuestionStatus(question.id);
          const questionFeedback = feedback[question.id];

          return (
            <div
              key={question.id}
              className={`bg-slate-700 rounded-lg overflow-hidden shadow-sm border-l-4 ${
                status === 'mastered' ? 'border-emerald-500' :
                status === 'learning' ? 'border-yellow-500' :
                status === 'needs-review' ? 'border-red-500' :
                'border-blue-500'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-slate-200">
                    {question.content}
                  </h3>
                  <div className="text-sm text-slate-400">
                    {status === 'mastered' && '✓ Dominado'}
                    {status === 'learning' && '↻ Aprendiendo'}
                    {status === 'needs-review' && '⚠ Necesita repaso'}
                    {status === 'new' && '✧ Nuevo'}
                  </div>
                </div>

                {/* Área de respuesta del usuario */}
                {!showAnswer[question.id] && (
                  <div className="space-y-4 mb-4">
                    <textarea
                      className="w-full p-3 bg-slate-800 text-slate-200 rounded-lg"
                      placeholder="Escribe tu respuesta aquí..."
                      value={userAnswers[question.id] || ''}
                      onChange={(e) => handleUserAnswer(question.id, e.target.value)}
                    />
                    <button
                      onClick={() => checkAnswer(question.id, question)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Verificar Respuesta
                    </button>
                  </div>
                )}

                {/* Feedback */}
                {questionFeedback && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    questionFeedback.isCorrect ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'
                  }`}>
                    {questionFeedback.message}
                  </div>
                )}

                {/* Respuesta y explicación */}
                {showAnswer[question.id] && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-emerald-400 mb-2">Respuesta Correcta:</h4>
                      <div className="bg-slate-800 p-3 rounded-lg text-slate-200">
                        {question.answer}
                      </div>
                    </div>
                    {question.explanation && (
                      <div>
                        <h4 className="font-semibold text-emerald-400 mb-2">Explicación:</h4>
                        <div className="bg-slate-800 p-3 rounded-lg text-slate-200">
                          {question.explanation}
                        </div>
                      </div>
                    )}
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setShowAnswer(prev => ({ ...prev, [question.id]: false }));
                          setUserAnswers(prev => ({ ...prev, [question.id]: '' }));
                          setFeedback(prev => ({ ...prev, [question.id]: null }));
                        }}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 