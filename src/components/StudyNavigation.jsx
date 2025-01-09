'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function StudyNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const modes = [
    {
      id: 'practice',
      name: 'Práctica',
      description: 'Preguntas de opción múltiple',
      path: '/'
    },
    {
      id: 'concepts',
      name: 'Conceptos',
      description: 'Definiciones y ejemplos',
      path: '/concepts'
    },
    {
      id: 'code',
      name: 'Código',
      description: 'Ejemplos prácticos',
      path: '/code'
    },
    {
      id: 'flashcards',
      name: 'Tarjetas',
      description: 'Repaso espaciado',
      path: '/flashcards'
    }
  ];

  return (
    <nav className="bg-slate-800 p-4 mb-8 rounded-lg">
      {/* Versión móvil */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => router.push(mode.path)}
            className={`p-3 rounded-lg transition-all text-center ${
              pathname === mode.path
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            <h3 className="font-semibold text-sm">{mode.name}</h3>
            <p className="text-xs opacity-80 hidden sm:block">{mode.description}</p>
          </button>
        ))}
      </div>

      {/* Versión escritorio */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => router.push(mode.path)}
            className={`p-4 rounded-lg transition-all ${
              pathname === mode.path
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            <h3 className="font-semibold mb-1">{mode.name}</h3>
            <p className="text-sm opacity-80">{mode.description}</p>
          </button>
        ))}
      </div>
    </nav>
  );
} 