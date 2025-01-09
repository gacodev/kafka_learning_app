import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Consulta base
    let where = {};
    
    // Agregar filtro de búsqueda si existe
    if (search.trim()) {
      where = {
        OR: [
          { term: { contains: search } },
          { definition: { contains: search } }
        ]
      };
    }

    const concepts = await prisma.concept.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        term: 'asc'
      },
      skip,
      take: limit
    });

    const total = await prisma.concept.count({ where });

    return NextResponse.json({
      concepts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });

  } catch (error) {
    console.error('Error al obtener conceptos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los conceptos' },
      { status: 500 }
    );
  }
} 