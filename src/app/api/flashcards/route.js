import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request) {
  console.log('📥 API Request recibida');
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const count = parseInt(searchParams.get('count')) || 10;
    
    console.log('🔍 Parámetros recibidos:', { category, count });

    // Primero obtenemos las categorías
    console.log('📚 Obteniendo categorías...');
    
    // Si es una petición inicial solo para categorías
    if (count === 1 && category === 'all') {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { concepts: true }
          }
        }
      });

      return NextResponse.json({
        categories: categories.filter(cat => cat._count.concepts > 0).map(cat => ({
          id: cat.id,
          name: cat.name
        })),
        flashcards: []
      });
    }

    // Si es una petición para obtener flashcards
    let flashcardsQuery = {};
    
    if (category && category !== 'all') {
      console.log('🎯 Buscando flashcards para categoría específica:', category);
      flashcardsQuery = {
        where: {
          categoryId: category
        }
      };
    }

    // Obtener los conceptos directamente
    const concepts = await prisma.concept.findMany({
      ...flashcardsQuery,
      select: {
        id: true,
        term: true,
        definition: true,
        example: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('📦 Conceptos encontrados:', concepts.length);

    // Obtener todas las categorías para el selector
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { concepts: true }
        }
      }
    });

    // Mezclar y limitar la cantidad de flashcards
    const selectedFlashcards = concepts
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(concept => ({
        id: concept.id,
        term: concept.term,
        definition: concept.definition,
        example: concept.example,
        categoryId: concept.categoryId,
        category: concept.category.name
      }));

    console.log('✨ Flashcards seleccionadas:', selectedFlashcards.length);

    return NextResponse.json({
      flashcards: selectedFlashcards,
      categories: categories.filter(cat => cat._count.concepts > 0).map(cat => ({
        id: cat.id,
        name: cat.name
      }))
    });

  } catch (error) {
    console.error('❌ Error en API:', error);
    return NextResponse.json(
      { error: 'Error al obtener las flashcards' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión a Prisma cerrada');
  }
} 