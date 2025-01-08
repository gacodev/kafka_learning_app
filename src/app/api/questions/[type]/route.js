import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { type } = params;

  try {
    let whereCondition = {};
    
    if (type === 'kafka_admin') {
      whereCondition.certification = 'Confluent Kafka Administrator';
      whereCondition.category = 'administrator';
    } else if (type === 'ccdak') {
      whereCondition.certification = 'Confluent Kafka Developer';
      whereCondition.category = 'developer';
    } else {
      return NextResponse.json({ message: 'Invalid certification type' }, { status: 400 });
    }

    console.log('Query conditions:', whereCondition);

    const questions = await prisma.question.findMany({
      where: whereCondition,
      select: {
        id: true,
        content: true,
        optionsJson: true,
        correctAnswer: true,
        explanation: true,
        topic: true,
        subtopicsJson: true,
        category: true,
        certification: true,
        importance: true,
        answer: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`Found ${questions.length} questions in database`);

    const formattedQuestions = questions.map(question => {
      try {
        let options = [];
        let subtopics = [];
        
        console.log(`\nProcessing question ${question.id}:`);
        
        try {
          if (question.optionsJson) {
            options = JSON.parse(question.optionsJson);
            console.log('Parsed options:', options);
          }
        } catch (e) {
          console.error(`Error parsing options for question ${question.id}:`, e);
        }

        // Si no hay opciones pero hay una respuesta, usamos la respuesta como única opción
        if (options.length === 0 && question.answer) {
          options = [question.answer];
          console.log('Using answer as single option:', options);
        }

        try {
          if (question.subtopicsJson) {
            subtopics = JSON.parse(question.subtopicsJson);
          }
        } catch (e) {
          console.error(`Error parsing subtopics for question ${question.id}:`, e);
        }

        if (!Array.isArray(options) || options.length === 0) {
          console.log(`Skipping question ${question.id} due to invalid options`);
          return null;
        }

        return {
          id: question.id,
          content: question.content,
          options: options,
          correctAnswer: question.correctAnswer || 0,
          explanation: question.explanation || '',
          topic: question.topic || 'General',
          subtopics: Array.isArray(subtopics) ? subtopics : [],
          category: question.category,
          certification: question.certification,
          importance: question.importance || 1,
          answer: question.answer || options[question.correctAnswer || 0]
        };
      } catch (error) {
        console.error(`Error processing question ${question.id}:`, error);
        return null;
      }
    }).filter(Boolean);

    console.log(`Formatted ${formattedQuestions.length} valid questions`);
    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ 
      message: 'Error fetching questions', 
      error: error.message 
    }, { status: 500 });
  }
} 