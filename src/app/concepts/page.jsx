import StudyNavigation from '@/components/StudyNavigation';
import ConceptsMode from '@/components/study-modes/ConceptsMode';

export default function ConceptsPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-slate-200">
          Preparación CCDAK
        </h1>
        
        <StudyNavigation />

        <div className="bg-slate-800 rounded-lg p-6">
          <ConceptsMode certification="CCDAK" />
        </div>
      </div>
    </main>
  );
} 