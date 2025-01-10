import { Suspense } from 'react';
import StudyNavigation from '@/components/StudyNavigation';
import FlashcardsMode from '@/components/study-modes/FlashcardsMode';

export default function FlashcardsPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-slate-200">
          Preparación CCDAK
        </h1>
        
        <Suspense fallback={<div>Cargando...</div>}>
          <StudyNavigation />
        </Suspense>

        <div className="bg-slate-800 rounded-lg p-6">
          <Suspense fallback={<div>Cargando tarjetas...</div>}>
            <FlashcardsMode />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 