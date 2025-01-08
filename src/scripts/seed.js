import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    // Leer los archivos JSON
    const developerExamples = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/codeExamples/developer.json'), 'utf8')
    );
    const adminExamples = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/codeExamples/admin.json'), 'utf8')
    );

    // Limpiar la base de datos
    await prisma.codeExample.deleteMany();

    // Procesar ejemplos de desarrollador
    for (const [category, content] of Object.entries(developerExamples.categories)) {
      for (const [subcategory, subContent] of Object.entries(content.subcategories)) {
        for (const [language, example] of Object.entries(subContent.examples)) {
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
        }
      }
    }

    // Procesar ejemplos de administrador
    for (const [category, content] of Object.entries(adminExamples.categories)) {
      for (const [subcategory, subContent] of Object.entries(content.subcategories)) {
        for (const [language, example] of Object.entries(subContent.examples)) {
          await prisma.codeExample.create({
            data: {
              type: 'admin',
              certification: 'CCAK',
              category,
              subcategory,
              language: example.language,
              code: example.code,
              explanation: example.explanation
            }
          });
        }
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
