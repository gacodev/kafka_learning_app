'use client';

import { useState, useEffect } from 'react';

const LEVELS = {
  NEW: { days: 0, name: 'Nuevo' },
  LEARNING: { days: 1, name: 'Aprendiendo' },
  REVIEWING: { days: 3, name: 'Repasando' },
  MASTERED: { days: 7, name: 'Dominado' }
};

export default function FlashcardsMode() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyProgress, setStudyProgress] = useState({});
  const [stats, setStats] = useState({
    new: 0,
    learning: 0,
    reviewing: 0,
    mastered: 0,
    dueToday: 0
  });

  useEffect(() => {
    fetchQuestions();
    loadProgress();
  }, []);

  useEffect(() => {
    updateStats();
  }, [questions, studyProgress]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar las preguntas');
      }

      // Filtrar y preparar preguntas
      const preparedQuestions = data.questions
        .filter(q => q.content && q.explanation)
        .map(q => ({
          id: q.id,
          front: q.content,
          back: q.explanation,
          category: q.categoryRel.name
        }));

      setQuestions(preparedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('flashcardProgress');
    if (saved) {
      setStudyProgress(JSON.parse(saved));
    }
  };

  const saveProgress = (newProgress) => {
    setStudyProgress(newProgress);
    localStorage.setItem('flashcardProgress', JSON.stringify(newProgress));
  };

  const updateStats = () => {
    const now = new Date();
    const newStats = {
      new: 0,
      learning: 0,
      reviewing: 0,
      mastered: 0,
      dueToday: 0
    };

    questions.forEach(question => {
      const progress = studyProgress[question.id];
      
      if (!progress) {
        newStats.new++;
        newStats.dueToday++;
      } else {
        const lastStudied = new Date(progress.lastStudied);
        const daysSince = Math.floor((now - lastStudied) / (1000 * 60 * 60 * 24));
        const dueDate = new Date(progress.nextDue);
        
        if (progress.level === 'MASTERED') {
          newStats.mastered++;
        } else if (progress.level === 'REVIEWING') {
          newStats.reviewing++;
        } else {
          newStats.learning++;
        }

        if (dueDate <= now) {
          newStats.dueToday++;
        }
      }
    });

    setStats(newStats);
  };

  const getDueQuestions = () => {
    const now = new Date();
    return questions.filter(q => {
      const progress = studyProgress[q.id];
      if (!progress) return true;
      const dueDate = new Date(progress.nextDue);
      return dueDate <= now;
    });
  };

  const handleResponse = (quality) => {
    const question = questions[currentIndex];
    const now = new Date();
    const progress = studyProgress[question.id] || {
      level: 'NEW',
      streak: 0,
      lastStudied: null,
      nextDue: null
    };

    let newLevel = progress.level;
    let newStreak = progress.streak;

    if (quality === 'good') {
      newStreak++;
      if (newStreak >= 2) {
        switch (progress.level) {
          case 'NEW':
            newLevel = 'LEARNING';
            break;
          case 'LEARNING':
            newLevel = 'REVIEWING';
            break;
          case 'REVIEWING':
            newLevel = 'MASTERED';
            break;
        }
      }
    } else {
      newStreak = 0;
      if (progress.level !== 'NEW') {
        newLevel = 'LEARNING';
      }
    }

    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + LEVELS[newLevel].days);

    const newProgress = {
      ...studyProgress,
      [question.id]: {
        level: newLevel,
        streak: newStreak,
        lastStudied: now.toISOString(),
        nextDue: nextDue.toISOString()
      }
    };

    saveProgress(newProgress);
    nextQuestion();
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    const dueQuestions = getDueQuestions();
    
    if (currentIndex + 1 < dueQuestions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-200">Cargando flashcards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const dueQuestions = getDueQuestions();
  if (dueQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-slate-200 mb-4">
          ¡Felicitaciones!
        </h3>
        <p className="text-slate-300">
          Has completado todas las tarjetas programadas para hoy.
        </p>
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-emerald-600/20 p-4 rounded">
            <div className="text-2xl font-bold text-emerald-400">{stats.mastered}</div>
            <div className="text-slate-300">Dominadas</div>
          </div>
          <div className="bg-yellow-600/20 p-4 rounded">
            <div className="text-2xl font-bold text-yellow-400">{stats.reviewing}</div>
            <div className="text-slate-300">Repasando</div>
          </div>
          <div className="bg-blue-600/20 p-4 rounded">
            <div className="text-2xl font-bold text-blue-400">{stats.learning}</div>
            <div className="text-slate-300">Aprendiendo</div>
          </div>
          <div className="bg-purple-600/20 p-4 rounded">
            <div className="text-2xl font-bold text-purple-400">{stats.new}</div>
            <div className="text-slate-300">Nuevas</div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = dueQuestions[currentIndex];
  const progress = studyProgress[currentQuestion.id];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progreso */}
      <div className="mb-6 grid grid-cols-5 gap-2 text-center text-sm">
        <div className="bg-slate-700 p-2 rounded">
          <div className="font-bold text-emerald-400">{stats.mastered}</div>
          <div className="text-slate-300">Dominadas</div>
        </div>
        <div className="bg-slate-700 p-2 rounded">
          <div className="font-bold text-yellow-400">{stats.reviewing}</div>
          <div className="text-slate-300">Repasando</div>
        </div>
        <div className="bg-slate-700 p-2 rounded">
          <div className="font-bold text-blue-400">{stats.learning}</div>
          <div className="text-slate-300">Aprendiendo</div>
        </div>
        <div className="bg-slate-700 p-2 rounded">
          <div className="font-bold text-purple-400">{stats.new}</div>
          <div className="text-slate-300">Nuevas</div>
        </div>
        <div className="bg-slate-700 p-2 rounded">
          <div className="font-bold text-slate-200">{stats.dueToday}</div>
          <div className="text-slate-300">Pendientes</div>
        </div>
      </div>

      {/* Tarjeta actual */}
      <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-800 flex justify-between items-center">
          <span className="text-slate-300">{currentQuestion.category}</span>
          <span className={`px-2 py-1 rounded text-sm ${
            !progress ? 'bg-purple-600/20 text-purple-400' :
            progress.level === 'MASTERED' ? 'bg-emerald-600/20 text-emerald-400' :
            progress.level === 'REVIEWING' ? 'bg-yellow-600/20 text-yellow-400' :
            'bg-blue-600/20 text-blue-400'
          }`}>
            {progress ? LEVELS[progress.level].name : 'Nueva'}
          </span>
        </div>
        
        <div
          className="p-8 min-h-[300px] flex items-center justify-center cursor-pointer"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <div className="text-center">
            <div className="text-lg text-slate-200">
              {showAnswer ? currentQuestion.back : currentQuestion.front}
            </div>
            {!showAnswer && (
              <div className="mt-4 text-sm text-slate-400">
                Click para ver la respuesta
              </div>
            )}
          </div>
        </div>

        {showAnswer && (
          <div className="p-4 bg-slate-800 flex justify-center gap-4">
            <button
              onClick={() => handleResponse('bad')}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Difícil
            </button>
            <button
              onClick={() => handleResponse('good')}
              className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Fácil
            </button>
          </div>
        )}
      </div>

      {/* Progreso de la sesión */}
      <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
        <div>
          Tarjeta {currentIndex + 1} de {dueQuestions.length}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600"
              style={{
                width: `${((currentIndex + 1) / dueQuestions.length) * 100}%`
              }}
            />
          </div>
          <span>{Math.round(((currentIndex + 1) / dueQuestions.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
} 