import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const count = parseInt(searchParams.get('count')) || 10;

    // Obtener conceptos
    let concepts = await prisma.concept.findMany({
      where: category && category !== 'all' ? { categoryId: category } : {},
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Mezclar aleatoriamente y limitar la cantidad
    concepts = concepts
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    // Obtener categorías
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            concepts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      flashcards: concepts,
      categories: categories.filter(cat => cat._count.concepts > 0)
    });
  } catch (error) {
    console.error('Error al obtener flashcards:', error);
    return NextResponse.json(
      { error: 'Error al obtener las flashcards' },
      { status: 500 }
    );
  }
} 