import './globals.css'

export const metadata = {
  title: 'Apache Kafka Training App',
  description: 'Aplicación de entrenamiento para certificaciones de Apache Kafka',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-900">
        <div className="flex h-screen">
          {/* Panel lateral */}
          <aside className="w-64 bg-slate-800 border-r border-slate-700 p-4">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-emerald-500">
                Apache Kafka Training
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Preparación para certificaciones
              </p>
            </div>

            {/* Menú de navegación */}
            <nav className="space-y-2">
              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Certificaciones
                </h2>
                <div className="mt-2 space-y-1">
                  <a href="/" className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white">
                    Confluent Kafka Administrator
                  </a>
                  <a href="/" className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white">
                    Confluent Kafka Developer
                  </a>
                </div>
              </div>

              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Modos de Estudio
                </h2>
                <div className="mt-2 space-y-1">
                  <a href="/" className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white">
                    Opción Múltiple
                  </a>
                  <a href="/" className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white">
                    Conceptos
                  </a>
                </div>
              </div>

              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recursos
                </h2>
                <div className="mt-2 space-y-1">
                  <a href="https://docs.confluent.io/platform/current/overview.html" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white">
                    Documentación Confluent
                  </a>
                  <a href="https://kafka.apache.org/documentation/" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white">
                    Documentación Apache Kafka
                  </a>
                </div>
              </div>
            </nav>

            {/* Footer del panel */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-xs text-slate-400">
                <p>© 2024 Apache Kafka Training</p>
                <p className="mt-1">Versión 1.0.0</p>
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
