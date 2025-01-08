'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeMode() {
  const [examples, setExamples] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExamples() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/code-examples/all');
        if (!response.ok) {
          throw new Error('Error fetching code examples');
        }
        
        const data = await response.json();
        console.log('Ejemplos cargados:', data); // Para debugging
        
        if (Object.keys(data).length === 0) {
          throw new Error('No se encontraron ejemplos de código');
        }

        setExamples(data);
        
        // Seleccionar valores iniciales
        const firstType = Object.keys(data)[0];
        if (firstType) {
          setSelectedType(firstType);
          const firstCategory = Object.keys(data[firstType].categories)[0];
          if (firstCategory) {
            setSelectedCategory(firstCategory);
            const firstSubcategory = Object.keys(
              data[firstType].categories[firstCategory].subcategories
            )[0];
            if (firstSubcategory) {
              setSelectedSubcategory(firstSubcategory);
              const firstLanguage = Object.keys(
                data[firstType].categories[firstCategory].subcategories[firstSubcategory].examples
              )[0];
              if (firstLanguage) {
                setSelectedLanguage(firstLanguage);
              }
            }
          }
        }

        // Cargar favoritos y notas guardadas
        const savedFavorites = localStorage.getItem('favoriteExamples');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        
        const savedNotes = localStorage.getItem('exampleNotes');
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
      } catch (error) {
        console.error('Error fetching examples:', error);
        setError(error.message || 'Error cargando los ejemplos de código');
      } finally {
        setLoading(false);
      }
    }

    fetchExamples();
  }, []);

  const toggleFavorite = (exampleId) => {
    const newFavorites = favorites.includes(exampleId)
      ? favorites.filter(id => id !== exampleId)
      : [...favorites, exampleId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteExamples', JSON.stringify(newFavorites));
  };

  const saveNote = (exampleId, note) => {
    const newNotes = { ...notes, [exampleId]: note };
    setNotes(newNotes);
    localStorage.setItem('exampleNotes', JSON.stringify(newNotes));
  };

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

  if (!examples) return null;

  const currentType = selectedType ? examples[selectedType] : null;
  const currentCategory = selectedCategory && currentType ? 
    currentType.categories[selectedCategory] : null;
  const currentSubcategory = selectedSubcategory && currentCategory ? 
    currentCategory.subcategories[selectedSubcategory] : null;
  const currentExample = currentSubcategory && selectedLanguage ? 
    currentSubcategory.examples[selectedLanguage] : null;

  return (
    <div className="space-y-6">
      {/* Selector de tipo (admin/developer) */}
      <div className="flex gap-4 flex-wrap">
        {Object.entries(examples).map(([type, content]) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setSelectedLanguage(null);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === type
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Selector de categorías */}
      {currentType && (
        <div className="flex gap-4 flex-wrap">
          {Object.entries(currentType.categories).map(([category, content]) => (
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
        <p className="text-slate-300 bg-slate-800 p-4 rounded-lg">
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

      {/* Contenido del ejemplo */}
      {currentSubcategory && (
        <div className="bg-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-slate-200">
              {selectedSubcategory}
            </h3>
            {currentExample && (
              <button
                onClick={() => toggleFavorite(currentExample.id)}
                className="text-yellow-400 hover:text-yellow-300"
              >
                {favorites.includes(currentExample.id) ? '★' : '☆'}
              </button>
            )}
          </div>

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
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-900">
                  <span className="text-slate-200">{currentExample.language}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentExample.code);
                    }}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Copiar
                  </button>
                </div>
                <SyntaxHighlighter
                  language={currentExample.language.toLowerCase()}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'transparent'
                  }}
                >
                  {currentExample.code}
                </SyntaxHighlighter>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-400 mb-2">Explicación:</h4>
                <p className="text-slate-200">{currentExample.explanation}</p>
              </div>

              {/* Notas personales */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-400 mb-2">Mis Notas:</h4>
                <textarea
                  value={notes[currentExample.id] || ''}
                  onChange={(e) => saveNote(currentExample.id, e.target.value)}
                  placeholder="Añade tus notas personales aquí..."
                  className="w-full bg-slate-900 text-slate-200 p-3 rounded-lg"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 