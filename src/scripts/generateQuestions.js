import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import 'dotenv/config';

// Constantes
const HUGGINGFACE_API = process.env.HUGGINGFACE_API;
const HF_TOKEN = process.env.HF_TOKEN;

// Lista de todas las categorías
export const CATEGORIES = [
    'Broker',
    'CLI',
    'Cluster-Administration',
    'Consumer',
    'Kafka-Connect',
    'Kafka-Streams',
    'KSQL',
    'Monitoring-Metrics',
    'Producer',
    'REST Proxy',
    'Schema-Registry',
    'Security',
    'Topic',
    'Zookeeper'
];

// Expresiones regulares para identificar partes de las preguntas
const QUESTION_REGEX = /## Question (\d+)\s*\n([\s\S]*?)(?=## Question|$)/g;
const OPTIONS_REGEX = /(?:^|\n)(?:- |[A-Z]\. )((?:(?!\n- |\n[A-Z]\. |\*\*Answer|\*\*Explanation).)*)/gm;
const RESPONSE_REGEX = /\*\*Answer:\*\*\s*([A-Z])/i;
const EXPLANATION_REGEX = /\*\*Explanation:\*\*([\s\S]*?)(?=## Question|$)/;

async function extractQuestionParts(content) {
    const questions = [];
    let match;

    while ((match = QUESTION_REGEX.exec(content)) !== null) {
        const questionNumber = match[1];
        const questionContent = match[2].trim();

        // Extraer la pregunta principal (todo hasta la primera opción)
        const questionText = questionContent.split(/(?=\n- |\n[A-Z]\. )/)[0].trim();

        // Extraer opciones
        const options = [];
        let optionMatch;
        const optionsText = questionContent;
        while ((optionMatch = OPTIONS_REGEX.exec(optionsText)) !== null) {
            const optionText = optionMatch[1].trim();
            if (!optionText.startsWith('**') && !optionText.includes('incorrect') && !optionText.includes('correct')) {
                options.push({
                    text: optionText,
                    isCorrect: false
                });
            }
        }

        // Extraer respuesta
        const responseMatch = questionContent.match(RESPONSE_REGEX);
        const response = responseMatch ? responseMatch[1].trim() : '';

        // Extraer explicación
        const explanationMatch = questionContent.match(EXPLANATION_REGEX);
        const explanation = explanationMatch ? explanationMatch[1].trim() : '';

        // Marcar la opción correcta
        if (response) {
            options.forEach((option) => {
                option.isCorrect = option.text.startsWith(response + '.');
            });
        }

        questions.push({
            id: `${questionNumber}`,
            type: 'multiple_choice',
            content: {
                question: questionText,
                options,
                explanation,
                response: `The correct answer is option ${response}`
            }
        });
    }

    return questions;
}

async function enrichQuestionWithLLM(question, category) {
    try {
        const prompt = `
        Analyze this Kafka exam question and provide:
        1. The difficulty level (basic, intermediate, advanced)
        2. The subcategory within ${category} (e.g., configuration, replication, etc.)
        3. Any relevant context
        4. Key concepts mentioned
        
        Question: ${question.content.question}
        `;

        const response = await axios.post(HUGGINGFACE_API, {
            inputs: prompt
        }, {
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const analysis = response.data[0].generated_text;
        
        return {
            id: `${category}_Q${question.id.padStart(3, '0')}`,
            type: question.type,
            category,
            subcategory: extractSubcategory(analysis),
            difficulty: extractDifficulty(analysis),
            content: {
                ...question.content,
                context: extractContext(analysis)
            },
            metadata: {
                key_concepts: extractKeyConcepts(analysis)
            }
        };
    } catch (error) {
        console.error('Error enriching question:', error);
        return null;
    }
}

// Funciones auxiliares para extraer información del análisis
function extractDifficulty(analysis) {
    const match = analysis.match(/difficulty.*?:\s*(basic|intermediate|advanced)/i);
    return match ? match[1].toLowerCase() : 'intermediate';
}

function extractSubcategory(analysis) {
    const match = analysis.match(/subcategory.*?:\s*([\w\s-]+)/i);
    return match ? match[1].trim().toLowerCase() : 'general';
}

function extractContext(analysis) {
    const match = analysis.match(/context.*?:\s*(.*?)(?=\n|$)/i);
    return match ? match[1].trim() : '';
}

function extractKeyConcepts(analysis) {
    const match = analysis.match(/key concepts.*?:\s*(.*?)(?=\n|$)/i);
    return match ? match[1].split(',').map(c => c.trim()) : [];
}

async function processMarkdownFile(filePath, category) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const questions = await extractQuestionParts(content);
        
        // Enriquecer cada pregunta con el LLM
        const enrichedQuestions = [];
        for (const q of questions) {
            const enrichedQuestion = await enrichQuestionWithLLM(q, category);
            if (enrichedQuestion) {
                enrichedQuestions.push(enrichedQuestion);
            }
        }

        return enrichedQuestions;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return null;
    }
}

export async function processCategory(category, questionsDir) {
    console.log(`\n📂 Processing category: ${category}`);
    const categoryPath = path.join(questionsDir, category);
    
    try {
        const files = await fs.readdir(categoryPath);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        const allQuestions = [];
        let processedFiles = 0;
        
        for (const file of mdFiles) {
            const filePath = path.join(categoryPath, file);
            const questions = await processMarkdownFile(filePath, category);
            if (questions) {
                allQuestions.push(...questions);
                processedFiles++;
            }
        }

        console.log(`✅ Completed ${category}: ${allQuestions.length} items from ${processedFiles}/${mdFiles.length} files`);
        return allQuestions;
    } catch (error) {
        console.error(`❌ Error in category ${category}:`, error.message);
        return [];
    }
}
