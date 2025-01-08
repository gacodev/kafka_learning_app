import { prisma } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener todos los ejemplos
    const examples = await prisma.codeExample.findMany({
      orderBy: [
        { certification: 'asc' },
        { category: 'asc' },
        { subcategory: 'asc' },
        { language: 'asc' }
      ]
    });

    // Transformar los ejemplos en una estructura jerárquica
    const structuredExamples = examples.reduce((acc, example) => {
      // Crear certificación si no existe
      if (!acc[example.certification]) {
        acc[example.certification] = {
          categories: {}
        };
      }

      // Crear categoría si no existe
      if (!acc[example.certification].categories[example.category]) {
        acc[example.certification].categories[example.category] = {
          description: example.description,
          subcategories: {}
        };
      }

      // Crear subcategoría si no existe
      if (!acc[example.certification].categories[example.category].subcategories[example.subcategory]) {
        acc[example.certification].categories[example.category].subcategories[example.subcategory] = {
          description: example.description,
          examples: {}
        };
      }

      // Añadir ejemplo
      acc[example.certification].categories[example.category].subcategories[example.subcategory].examples[example.language] = {
        language: example.language,
        code: example.code,
        explanation: example.explanation
      };

      return acc;
    }, {});

    res.status(200).json(structuredExamples);
  } catch (error) {
    console.error('Error fetching code examples:', error);
    res.status(500).json({ error: 'Error fetching code examples' });
  }
} 