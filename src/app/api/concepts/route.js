import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Obtener conceptos
    const concepts = await prisma.concept.findMany({
      where: category ? { categoryId: category } : {},
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        term: 'asc'
      }
    });

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
      concepts,
      categories: categories.filter(cat => cat._count.concepts > 0)
    });
  } catch (error) {
    console.error('Error al obtener conceptos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los conceptos' },
      { status: 500 }
    );
  }
} 