'use client';

import { useState, useEffect } from 'react';

export default function CodeMode() {
  const [examples, setExamples] = useState(null);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExamples() {
      try {
        setLoading(true);
        const response = await fetch('/api/code-examples/all');
        if (!response.ok) {
          throw new Error('Error fetching code examples');
        }
        const data = await response.json();
        setExamples(data);
        
        // Seleccionar primera certificación por defecto
        const firstCertification = Object.keys(data)[0];
        if (firstCertification) {
          setSelectedCertification(firstCertification);
          
          // Seleccionar primera categoría por defecto
          const firstCategory = Object.keys(data[firstCertification].categories)[0];
          if (firstCategory) {
            setSelectedCategory(firstCategory);
            
            // Seleccionar primera subcategoría por defecto
            const firstSubcategory = Object.keys(
              data[firstCertification].categories[firstCategory].subcategories
            )[0];
            if (firstSubcategory) {
              setSelectedSubcategory(firstSubcategory);
              
              // Seleccionar primer lenguaje por defecto
              const firstLanguage = Object.keys(
                data[firstCertification].categories[firstCategory].subcategories[firstSubcategory].examples
              )[0];
              if (firstLanguage) {
                setSelectedLanguage(firstLanguage);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching examples:', error);
        setError('Error cargando los ejemplos de código');
      } finally {
        setLoading(false);
      }
    }

    fetchExamples();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-200">Cargando ejemplos...</div>
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

  if (!examples) {
    return null;
  }

  const currentCertification = selectedCertification ? examples[selectedCertification] : null;
  const currentCategory = selectedCategory && currentCertification ? 
    currentCertification.categories[selectedCategory] : null;
  const currentSubcategory = selectedSubcategory && currentCategory ? 
    currentCategory.subcategories[selectedSubcategory] : null;
  const currentExample = currentSubcategory && selectedLanguage ? 
    currentSubcategory.examples[selectedLanguage] : null;

  return (
    <div className="space-y-6">
      {/* Selector de certificaciones */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(examples).map(([cert, content]) => (
          <button
            key={cert}
            onClick={() => {
              setSelectedCertification(cert);
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setSelectedLanguage(null);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCertification === cert
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {cert && cert.charAt(0).toUpperCase() + cert.slice(1)}
          </button>
        ))}
      </div>

      {/* Selector de categorías */}
      {currentCertification && (
        <div className="flex gap-4 flex-wrap">
          {Object.entries(currentCertification.categories).map(([category, content]) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedSubcategory(null);
                setSelectedLanguage(null);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Descripción de la categoría */}
      {currentCategory && (
        <p className="text-slate-300">
          {currentCategory.description}
        </p>
      )}

      {/* Selector de subcategorías */}
      {currentCategory && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(currentCategory.subcategories).map(([subcat, content]) => (
            <button
              key={subcat}
              onClick={() => {
                setSelectedSubcategory(subcat);
                setSelectedLanguage(Object.keys(content.examples)[0]);
              }}
              className={`px-3 py-1 rounded transition-colors ${
                selectedSubcategory === subcat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
              }`}
            >
              {subcat}
            </button>
          ))}
        </div>
      )}

      {/* Contenido de la subcategoría */}
      {currentSubcategory && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            {selectedSubcategory}
          </h3>
          <p className="text-slate-300 mb-4">
            {currentSubcategory.description}
          </p>

          {/* Selector de lenguajes */}
          <div className="flex gap-2 mb-4">
            {Object.entries(currentSubcategory.examples).map(([lang, example]) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                }`}
              >
                {example.language}
              </button>
            ))}
          </div>

          {/* Código y explicación */}
          {currentExample && (
            <div>
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <pre className="text-slate-200 overflow-x-auto">
                  <code>{currentExample.code}</code>
                </pre>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-400 mb-2">Explicación:</h4>
                <p className="text-slate-200">{currentExample.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 