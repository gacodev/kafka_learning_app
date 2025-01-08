'use client';

import { useState } from 'react';

const DOCUMENTATION_LINKS = [
  {
    title: 'Apache Kafka',
    links: [
      {
        name: 'Documentación Oficial',
        url: 'https://kafka.apache.org/documentation/'
      },
      {
        name: 'Guía de Inicio',
        url: 'https://kafka.apache.org/quickstart'
      },
      {
        name: 'Configuración',
        url: 'https://kafka.apache.org/documentation/#configuration'
      }
    ]
  },
  {
    title: 'Confluent',
    links: [
      {
        name: 'Certificación CCDAK',
        url: 'https://www.confluent.io/certification/apache-kafka-developer/'
      },
      {
        name: 'Certificación Admin',
        url: 'https://www.confluent.io/certification/apache-kafka-admin/'
      },
      {
        name: 'Blog Técnico',
        url: 'https://www.confluent.io/blog/'
      }
    ]
  },
  {
    title: 'Recursos',
    links: [
      {
        name: 'Kafka Streams',
        url: 'https://kafka.apache.org/documentation/streams/'
      },
      {
        name: 'Schema Registry',
        url: 'https://docs.confluent.io/platform/current/schema-registry/index.html'
      },
      {
        name: 'Kafka Connect',
        url: 'https://docs.confluent.io/platform/current/connect/index.html'
      }
    ]
  }
];

export default function Sidebar({ 
  selectedMode,
  setSelectedMode,
  selectedCertification,
  setSelectedCertification,
  studyModes,
  certifications 
}) {
  const [expandedSection, setExpandedSection] = useState('study');

  return (
    <aside className="w-64 bg-slate-800 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold text-emerald-400 mb-8">
          Apache Kafka Training
        </h1>

        {/* Sección de Modos de Estudio */}
        <div className="mb-8">
          <button
            onClick={() => setExpandedSection(expandedSection === 'study' ? null : 'study')}
            className="flex items-center justify-between w-full text-left text-slate-200 font-semibold mb-2"
          >
            <span>Modos de Estudio</span>
            <span className="text-lg">{expandedSection === 'study' ? '−' : '+'}</span>
          </button>
          
          {expandedSection === 'study' && (
            <div className="space-y-2">
              {Object.entries(studyModes).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMode(key)}
                  className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedMode === key
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Certificaciones */}
        <div className="mb-8">
          <button
            onClick={() => setExpandedSection(expandedSection === 'cert' ? null : 'cert')}
            className="flex items-center justify-between w-full text-left text-slate-200 font-semibold mb-2"
          >
            <span>Certificaciones</span>
            <span className="text-lg">{expandedSection === 'cert' ? '−' : '+'}</span>
          </button>
          
          {expandedSection === 'cert' && (
            <div className="space-y-2">
              {Object.entries(certifications).map(([key, cert]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCertification(key)}
                  className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCertification === key
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cert.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enlaces de Documentación */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'docs' ? null : 'docs')}
            className="flex items-center justify-between w-full text-left text-slate-200 font-semibold mb-2"
          >
            <span>Documentación</span>
            <span className="text-lg">{expandedSection === 'docs' ? '−' : '+'}</span>
          </button>
          
          {expandedSection === 'docs' && (
            <div className="space-y-6">
              {DOCUMENTATION_LINKS.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-400">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.links.map((link) => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-slate-300 hover:text-emerald-400 transition-colors"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 