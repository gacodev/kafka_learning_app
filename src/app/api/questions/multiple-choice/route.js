import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const count = parseInt(searchParams.get('count')) || 10;

    // Obtener preguntas
    let questions = await prisma.question.findMany({
      where: {
        type: 'multiple_choice',
        ...(category && category !== 'all' ? { categoryId: category } : {})
      },
      include: {
        categoryRel: {
          select: {
            id: true,
            name: true
          }
        },
        questionOptions: {
          select: {
            text: true,
            isCorrect: true,
            originalIndex: true
          }
        }
      }
    });

    // Mezclar aleatoriamente y limitar la cantidad
    questions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    // Obtener categorías
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            questions: {
              where: {
                type: 'multiple_choice'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      questions,
      categories: categories.filter(cat => cat._count.questions > 0)
    });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las preguntas' },
      { status: 500 }
    );
  }
} 