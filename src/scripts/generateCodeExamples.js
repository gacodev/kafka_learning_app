import fs from 'fs';
import path from 'path';
import { CODE_EXAMPLES } from '../data/codeExamples/index.js';

function flattenExamples() {
  const examples = [];

  // Iterar sobre las certificaciones
  Object.entries(CODE_EXAMPLES).forEach(([certification, certData]) => {
    // Iterar sobre las categorías
    Object.entries(certData.categories).forEach(([category, catData]) => {
      // Iterar sobre las subcategorías
      Object.entries(catData.subcategories).forEach(([subcategory, subData]) => {
        // Iterar sobre los ejemplos
        Object.entries(subData.examples).forEach(([language, example]) => {
          examples.push({
            certification,
            category,
            subcategory,
            language,
            title: `${category} - ${subcategory}`,
            description: subData.description,
            code: example.code,
            explanation: example.explanation
          });
        });
      });
    });
  });

  return examples;
}

async function generateJson() {
  try {
    const examples = flattenExamples();
    const outputPath = path.join(process.cwd(), 'src', 'data', 'codeExamples.json');
    
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(examples, null, 2),
      'utf8'
    );

    console.log(`Generated ${examples.length} code examples at ${outputPath}`);
  } catch (error) {
    console.error('Error generating code examples:', error);
    process.exit(1);
  }
}

generateJson(); 