import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUESTIONS_DIR = path.join(__dirname, '../../CCDAK-Exam-Questions');
const OUTPUT_FILE = path.join(__dirname, '../data/questions.json');

function extractOptionsFromContent(content) {
  const lines = content.split('\n');
  const options = [];
  let correctAnswer = -1;
  let correctAnswerText = '';

  lines.forEach((line, index) => {
    const optionMatch = line.trim().match(/^([A-D])\)\s*(.+)$/);
    if (optionMatch) {
      const [, letter, text] = optionMatch;
      options.push(text.trim());
      
      // Si la siguiente línea indica que esta es la respuesta correcta
      if (lines[index + 1] && lines[index + 1].toLowerCase().includes('correct')) {
        correctAnswer = options.length - 1;
        correctAnswerText = text.trim();
      }
    }
  });

  return { options, correctAnswer, correctAnswerText };
}

function processQuestionFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const questions = [];
  let currentQuestion = null;

  lines.forEach(line => {
    const questionMatch = line.match(/^\d+\.\s+(.+)/);
    if (questionMatch) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      const { options, correctAnswer, correctAnswerText } = extractOptionsFromContent(content);
      currentQuestion = {
        content: questionMatch[1].trim(),
        optionsJson: JSON.stringify(options),
        correctAnswer: correctAnswer,
        explanation: '',
        topic: path.basename(path.dirname(filePath)),
        subtopicsJson: '[]',
        category: filePath.toLowerCase().includes('admin') ? 'administrator' : 'developer',
        certification: filePath.toLowerCase().includes('admin') ? 
          'Confluent Kafka Administrator' : 'Confluent Kafka Developer',
        importance: 1,
        answer: correctAnswerText
      };
    } else if (currentQuestion && line.toLowerCase().includes('explanation:')) {
      currentQuestion.explanation = line.replace(/explanation:\s*/i, '').trim();
    }
  });

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
}

function generateQuestions() {
  console.log('Starting question generation...');
  console.log('Questions directory:', QUESTIONS_DIR);
  
  const allQuestions = [];
  
  try {
    const processDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          processDirectory(fullPath);
        } else if (item.endsWith('.md')) {
          console.log('Processing file:', fullPath);
          const questions = processQuestionFile(fullPath);
          allQuestions.push(...questions);
        }
      });
    };

    processDirectory(QUESTIONS_DIR);
    
    console.log(`Generated ${allQuestions.length} questions`);
    
    // Asegurarse de que el directorio data existe
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allQuestions, null, 2));
    console.log('Questions saved to:', OUTPUT_FILE);
  } catch (error) {
    console.error('Error generating questions:', error);
  }
}

generateQuestions(); 