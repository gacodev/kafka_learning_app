import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedCodeExamples() {
  try {
    console.log('Importando ejemplos de código...');

    // Leer archivos JSON de ejemplos
    const adminExamples = JSON.parse(
      readFileSync(path.join('src', 'data', 'codeExamples', 'admin.json'), 'utf8')
    );
    const developerExamples = JSON.parse(
      readFileSync(path.join('src', 'data', 'codeExamples', 'developer.json'), 'utf8')
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

async function main() {
  try {
    console.log('=== Iniciando proceso de seed ===');
    
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
