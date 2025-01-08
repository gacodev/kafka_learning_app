'use client';

import { useState } from 'react';
import MultipleChoiceMode from '@/components/study-modes/MultipleChoiceMode';
import ConceptsMode from '@/components/study-modes/ConceptsMode';
import CodeMode from '@/components/study-modes/CodeMode';
import Sidebar from '@/components/Sidebar';

const STUDY_MODES = {
  multiple_choice: {
    name: 'Opción Múltiple',
    component: MultipleChoiceMode
  },
  concepts: {
    name: 'Conceptos',
    component: ConceptsMode
  },
  code: {
    name: 'Ejemplos de Código',
    component: CodeMode
  }
};

const CERTIFICATIONS = {
  kafka_admin: {
    name: 'Confluent Kafka Administrator',
    description: 'Preguntas y ejemplos para la certificación de Administrador de Apache Kafka'
  },
  ccdak: {
    name: 'Confluent Kafka Developer',
    description: 'Preguntas y ejemplos para la certificación de Desarrollador de Apache Kafka'
  }
};

export default function Home() {
  const [selectedMode, setSelectedMode] = useState('multiple_choice');
  const [selectedCertification, setSelectedCertification] = useState('kafka_admin');

  const StudyComponent = STUDY_MODES[selectedMode].component;

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        selectedCertification={selectedCertification}
        setSelectedCertification={setSelectedCertification}
        studyModes={STUDY_MODES}
        certifications={CERTIFICATIONS}
      />

      <main className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-200">
            {CERTIFICATIONS[selectedCertification].name}
          </h2>
          <p className="text-slate-400 mt-2">
            {CERTIFICATIONS[selectedCertification].description}
          </p>
        </div>

        <StudyComponent certification={selectedCertification} />
      </main>
    </div>
  );
}
