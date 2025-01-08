import fs from 'fs';
import path from 'path';

const ERROR_LOG_FILE = path.join('src', 'logs', 'question_extraction_errors.log');

function logError(message, questionData, filePath) {
  const timestamp = new Date().toISOString();
  const errorLog = `
=== ERROR ${timestamp} ===
File: ${filePath}
Message: ${message}
Question Data:
${JSON.stringify(questionData, null, 2)}
======================\n`;

  fs.appendFileSync(ERROR_LOG_FILE, errorLog);
}

export function extractQuestion(content, filePath = 'unknown') {
  try {
    // Estructura base de la pregunta
    const question = {
      title: '',
      content: '',
      options: [],
      rawAnswer: '',
      answer: '',
      explanation: '',
      category: 'CCDAK',
      metadata: {
        sourceFile: filePath,
        extractionDate: new Date().toISOString(),
        quality: 'incomplete',
        structureIssues: [],
        originalFormat: {}
      }
    };

    // Dividir el contenido en líneas
    const lines = (content || '').split('\n').map(line => line.trim());
    let currentSection = null;
    let contentLines = [];
    let explanationLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Detectar título
      if (line.startsWith('##')) {
        question.title = line.replace(/^#+\s*/, '').trim();
        continue;
      }

      // Detectar opciones
      const optionMatch = line.match(/^([1-4])\.\s+(.+)/);
      if (optionMatch) {
        question.options.push({
          index: optionMatch[1],
          text: optionMatch[2],
          originalIndex: optionMatch[1]
        });
        continue;
      }

      // Detectar respuesta
      if (line.toLowerCase().includes('correct answer is')) {
        const answerMatch = line.match(/correct answer is \*\*([1-4])/i);
        if (answerMatch) {
          question.rawAnswer = answerMatch[1];
          question.answer = (parseInt(answerMatch[1]) - 1).toString();
        }
        continue;
      }

      // Detectar explicación
      if (line.toLowerCase().includes('explanation:')) {
        currentSection = 'explanation';
        continue;
      }

      // Acumular líneas según la sección
      if (currentSection === 'explanation') {
        explanationLines.push(line);
      } else if (!line.toLowerCase().includes('choose the correct answer')) {
        contentLines.push(line);
      }
    }

    // Procesar contenido acumulado
    question.content = contentLines.join('\n').trim();
    question.explanation = explanationLines.join('\n').trim();

    // Evaluar calidad
    let qualityScore = 100;
    const structureIssues = [];

    if (!question.content) {
      structureIssues.push('Missing content');
      qualityScore -= 30;
    }
    if (question.options.length === 0) {
      structureIssues.push('No options found');
      qualityScore -= 30;
    }
    if (!question.rawAnswer) {
      structureIssues.push('No answer specified');
      qualityScore -= 20;
    }
    if (!question.explanation) {
      structureIssues.push('No explanation provided');
      qualityScore -= 10;
    }

    question.metadata.quality = qualityScore >= 90 ? 'high' :
                              qualityScore >= 70 ? 'medium' :
                              qualityScore >= 50 ? 'low' : 'incomplete';
    
    question.metadata.structureIssues = structureIssues;
    question.metadata.qualityScore = qualityScore;

    return question;
  } catch (error) {
    console.error('Error extracting question:', error);
    return {
      title: 'Error processing question',
      content: content?.substring(0, 100) || 'Invalid content',
      options: [],
      answer: '0',
      explanation: '',
      category: 'CCDAK',
      metadata: {
        sourceFile: filePath,
        extractionDate: new Date().toISOString(),
        quality: 'error',
        structureIssues: ['Extraction error: ' + error.message],
        originalContent: content
      }
    };
  }
}
