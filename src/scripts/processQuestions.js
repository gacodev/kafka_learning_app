import { readdir, readFile } from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { extractQuestion } from '../utils/questionExtractor.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Asegurarse de que el directorio de logs existe
const LOGS_DIR = path.join('src', 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

async function getOrCreateCategory(categoryName) {
  try {
    console.log(`Buscando categoría: ${categoryName}`);
    let category = await prisma.category.findFirst({
      where: { name: categoryName }
    });

    if (!category) {
      console.log(`Creando nueva categoría: ${categoryName}`);
      category = await prisma.category.create({
        data: {
          name: categoryName,
          description: `Questions related to ${categoryName}`
        }
      });
    }

    return category;
  } catch (error) {
    console.error(`Error en getOrCreateCategory: ${error.message}`);
    throw error;
  }
}

async function insertQuestion(questionData, categoryId, filePath) {
  try {
    console.log(`Procesando pregunta: ${questionData.title?.substring(0, 50) || 'Sin título'}...`);
    console.log(`Archivo fuente: ${filePath}`);
    console.log(`Categoría ID: ${categoryId}`);
    console.log(`Calidad: ${questionData.metadata?.quality || 'unknown'}`);
    console.log(`Puntuación: ${questionData.metadata?.qualityScore || 0}%`);

    const question = await prisma.question.create({
      data: {
        title: questionData.title || questionData.content?.substring(0, 100) || 'Sin título',
        content: questionData.content || '',
        optionsData: JSON.stringify(questionData.options || []),
        answer: questionData.answer || '0',
        explanation: questionData.explanation || '',
        category: 'CCDAK',
        categoryId: categoryId,
        qualityScore: questionData.metadata?.qualityScore || 0,
        qualityLevel: questionData.metadata?.quality || 'unknown',
        sourceFile: filePath,
        questionOptions: {
          create: (questionData.options || []).map((option, idx) => ({
            text: option.text || '',
            isCorrect: idx.toString() === (questionData.answer || '0'),
            originalIndex: option.originalIndex || '',
            confidence: (questionData.metadata?.quality === 'high') ? 'high' : 'low'
          }))
        }
      }
    });

    console.log(`Pregunta insertada con ID: ${question.id}`);
    return question;
  } catch (error) {
    console.error(`Error insertando pregunta: ${error.message}`);
    console.error('Datos de la pregunta:', JSON.stringify(questionData, null, 2));
    throw error;
  }
}

async function processFile(filePath) {
  console.log(`\nProcesando archivo: ${filePath}`);
  
  try {
    const categoryName = path.basename(path.dirname(filePath));
    console.log(`Categoría: ${categoryName}`);
    
    const category = await getOrCreateCategory(categoryName);
    console.log(`ID de categoría: ${category.id}`);
    
    const content = await readFile(filePath, 'utf-8');
    const questions = content.split(/## Question \d+/).filter(Boolean);
    console.log(`Encontradas ${questions.length} preguntas`);
    
    let processed = 0;
    let skipped = 0;
    
    for (const [index, questionText] of questions.entries()) {
      try {
        console.log(`\nProcesando pregunta ${index + 1}/${questions.length}`);
        const questionData = extractQuestion(questionText, filePath);
        
        if (questionData && typeof questionData === 'object') {
          await insertQuestion(questionData, category.id, filePath);
          processed++;
          console.log('Pregunta insertada correctamente');
        } else {
          console.log('Pregunta inválida, saltando...');
          skipped++;
        }
      } catch (error) {
        console.error(`Error procesando pregunta: ${error.message}`);
        skipped++;
      }
    }
    
    return { processed, skipped, total: questions.length };
  } catch (error) {
    console.error(`Error procesando archivo ${filePath}: ${error.message}`);
    return { processed: 0, skipped: 0, total: 0 };
  }
}

async function processDirectory(dirPath) {
  const stats = {
    processedFiles: 0,
    processedQuestions: 0,
    skippedQuestions: 0
  };

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subStats = await processDirectory(fullPath);
        Object.keys(stats).forEach(key => {
          stats[key] += subStats[key];
        });
      } else if (entry.isFile() && 
                 entry.name.endsWith('.md') && 
                 !entry.name.toLowerCase().includes('readme') && 
                 !entry.name.includes('last_minute_review')) {
        
        const fileStats = await processFile(fullPath);
        stats.processedFiles++;
        stats.processedQuestions += fileStats.processed;
        stats.skippedQuestions += fileStats.skipped;
      }
    }
  } catch (error) {
    console.error(`Error procesando directorio ${dirPath}: ${error.message}`);
  }

  return stats;
}

async function main() {
  try {
    console.log('=== Inicio del Proceso de Extracción de Preguntas ===');
    
    // Limpiar la base de datos
    console.log('Limpiando base de datos...');
    await prisma.option.deleteMany();
    await prisma.question.deleteMany();
    await prisma.category.deleteMany();
    console.log('Base de datos limpiada');

    // Procesar archivos
    const stats = await processDirectory('./CCDAK-Exam-Questions');
    
    // Mostrar resumen
    console.log('\n=== Resumen del Procesamiento ===');
    console.log(`Archivos procesados: ${stats.processedFiles}`);
    console.log(`Preguntas procesadas: ${stats.processedQuestions}`);
    console.log(`Preguntas omitidas: ${stats.skippedQuestions}`);
    
    // Verificar resultados
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
    
    console.log('\n=== Categorías Creadas ===');
    categories.forEach(cat => {
      console.log(`${cat.name}: ${cat._count.questions} preguntas`);
    });
    
  } catch (error) {
    console.error('ERROR CRÍTICO:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 