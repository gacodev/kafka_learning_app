import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { certification } = params;
    
    const examples = await prisma.codeExample.findMany({
      where: {
        certification: certification.toUpperCase()
      }
    });

    // Transformar los datos al formato esperado
    const formattedData = examples.reduce((acc, example) => {
      // Inicializar el tipo si no existe
      if (!acc[example.type]) {
        acc[example.type] = {
          categories: {}
        };
      }

      // Inicializar la categoría si no existe
      if (!acc[example.type].categories[example.category]) {
        acc[example.type].categories[example.category] = {
          description: `Ejemplos de código para ${example.category}`,
          subcategories: {}
        };
      }

      // Inicializar la subcategoría si no existe
      if (!acc[example.type].categories[example.category].subcategories[example.subcategory]) {
        acc[example.type].categories[example.category].subcategories[example.subcategory] = {
          description: `Ejemplos de ${example.subcategory}`,
          examples: {}
        };
      }

      // Agregar el ejemplo
      acc[example.type].categories[example.category].subcategories[example.subcategory].examples[example.language.toLowerCase()] = {
        id: example.id,
        language: example.language,
        code: example.code,
        explanation: example.explanation
      };

      return acc;
    }, {});

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching code examples:', error);
    return NextResponse.json(
      { error: 'Error al obtener los ejemplos de código' },
      { status: 500 }
    );
  }
} 