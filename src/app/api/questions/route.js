import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const quality = searchParams.get('quality');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir el where basado en los parámetros
    const where = {};
    if (category) {
      where.categoryRel = {
        name: category
      };
    }
    if (quality) {
      where.qualityLevel = quality;
    }

    // Obtener preguntas con sus opciones y metadata
    const questions = await prisma.question.findMany({
      where,
      include: {
        categoryRel: true,
        questionOptions: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
            originalIndex: true,
            confidence: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        id: 'asc'
      }
    });

    // Obtener el total de preguntas para la paginación
    const total = await prisma.question.count({ where });

    // Obtener estadísticas
    const stats = await prisma.question.groupBy({
      by: ['qualityLevel'],
      _count: true
    });

    return NextResponse.json({
      questions,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las preguntas' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener categorías
export async function POST(request) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    );
  }
} 