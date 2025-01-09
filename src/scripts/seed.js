import { readFileSync } from 'fs';
import path from 'path';
import { prisma } from './config.js';
import { CATEGORIES, processCategory } from './generateQuestions.js';

async function seedCodeExamples() {
  try {
    console.log('Importando ejemplos de código...');

    // Leer archivos JSON de ejemplos
    const adminExamples = JSON.parse(
      readFileSync(path.join(process.cwd(), 'src', 'data', 'codeExamples', 'admin.json'), 'utf8')
    );
    const developerExamples = JSON.parse(
      readFileSync(path.join(process.cwd(), 'src', 'data', 'codeExamples', 'developer.json'), 'utf8')
    );

    // Limpiar ejemplos existentes
    await prisma.codeExample.deleteMany();
    console.log('Ejemplos anteriores eliminados');

    // Insertar ejemplos de administrador
    for (const category in adminExamples.categories) {
      const categoryData = adminExamples.categories[category];
      
      for (const subcategory in categoryData.subcategories) {
        const subcategoryData = categoryData.subcategories[subcategory];
        
        for (const language in subcategoryData.examples) {
          const example = subcategoryData.examples[language];
          
          await prisma.codeExample.create({
            data: {
              type: 'admin',
              certification: 'CCDAK',
              category,
              subcategory,
              language: example.language,
              code: example.code,
              explanation: example.explanation
            }
          });
          console.log(`Insertado ejemplo admin: ${category}/${subcategory}/${example.language}`);
        }
      }
    }

    // Insertar ejemplos de desarrollador
    for (const category in developerExamples.categories) {
      const categoryData = developerExamples.categories[category];
      
      for (const subcategory in categoryData.subcategories) {
        const subcategoryData = categoryData.subcategories[subcategory];
        
        for (const language in subcategoryData.examples) {
          const example = subcategoryData.examples[language];
          
          await prisma.codeExample.create({
            data: {
              type: 'developer',
              certification: 'CCDAK',
              category,
              subcategory,
              language: example.language,
              code: example.code,
              explanation: example.explanation
            }
          });
          console.log(`Insertado ejemplo developer: ${category}/${subcategory}/${example.language}`);
        }
      }
    }

    console.log('Ejemplos de código insertados correctamente');
  } catch (error) {
    console.error('Error al insertar ejemplos de código:', error);
    throw error;
  }
}

async function seedQuestionsAndConcepts() {
  try {
    console.log('Procesando preguntas y conceptos...');

    // Limpiar datos existentes
    await prisma.option.deleteMany();
    await prisma.question.deleteMany();
    await prisma.concept.deleteMany();
    await prisma.category.deleteMany();
    console.log('Base de datos limpiada');

    // Procesar cada categoría
    const questionsDir = path.join(process.cwd(), 'src/data/CCDAK-Exam-Questions');
    
    for (const categoryName of CATEGORIES) {
      // Crear la categoría en la base de datos
      const category = await prisma.category.create({
        data: {
          name: categoryName,
          description: `Questions and concepts related to ${categoryName}`
        }
      });

      // Procesar las preguntas de la categoría
      const questions = await processCategory(categoryName, questionsDir);
      
      // Insertar las preguntas en la base de datos
      for (const questionData of questions) {
        const { content, metadata, difficulty, subcategory } = questionData;
        
        // Crear la pregunta
        const question = await prisma.question.create({
          data: {
            title: content.question.substring(0, 100), // Título truncado para la vista previa
            content: content.question,
            optionsData: JSON.stringify(content.options),
            answer: content.response,
            explanation: content.explanation,
            type: 'multiple_choice',
            category: categoryName,
            categoryId: category.id,
            qualityLevel: difficulty,
            sourceFile: metadata?.source || 'unknown'
          }
        });

        // Crear las opciones relacionadas
        for (const [index, option] of content.options.entries()) {
          await prisma.option.create({
            data: {
              text: option.text,
              isCorrect: option.isCorrect,
              questionId: question.id,
              originalIndex: String.fromCharCode(65 + index), // Convertir índice a letra (A, B, C, etc.)
              confidence: 'high'
            }
          });
        }

        // Crear conceptos relacionados si existen
        if (metadata?.key_concepts) {
          for (const concept of metadata.key_concepts) {
            await prisma.concept.create({
              data: {
                term: concept,
                definition: `Key concept related to ${categoryName}: ${concept}`,
                categoryId: category.id
              }
            });
          }
        }
      }
      
      console.log(`✅ Categoría ${categoryName} procesada`);
    }

    // Verificar resultados
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { 
            questions: true,
            concepts: true
          }
        }
      }
    });
    
    console.log('\n=== Categorías Creadas ===');
    categories.forEach(cat => {
      console.log(`${cat.name}:`);
      console.log(`  - Preguntas: ${cat._count.questions}`);
      console.log(`  - Conceptos: ${cat._count.concepts}`);
    });

  } catch (error) {
    console.error('Error al procesar preguntas y conceptos:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('=== Iniciando proceso de seed ===');
    
    // Procesar preguntas y conceptos
    console.log('\n=== Procesando preguntas y conceptos ===');
    await seedQuestionsAndConcepts();
    
    // Procesar los ejemplos de código
    console.log('\n=== Procesando ejemplos de código ===');
    await seedCodeExamples();
    
    console.log('\n=== Proceso de seed completado exitosamente ===');
  } catch (error) {
    console.error('ERROR CRÍTICO:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
