'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function StudyNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const modes = [
    {
      id: 'practice',
      name: 'Práctica',
      description: 'Practica con preguntas de examen',
      path: '/'
    },
    {
      id: 'concepts',
      name: 'Conceptos',
      description: 'Aprende conceptos clave',
      path: '/concepts'
    },
    {
      id: 'code',
      name: 'Ejemplos de Código',
      description: 'Explora ejemplos prácticos',
      path: '/code'
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: 'Repasa con tarjetas de memoria',
      path: '/flashcards'
    }
  ];

  return (
    <nav className="bg-slate-800 p-4 mb-8 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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