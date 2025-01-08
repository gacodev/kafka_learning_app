import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const developerExamples = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'developer.json'), 'utf8')
);

const adminExamples = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'admin.json'), 'utf8')
);

export const codeExamples = {
  developer: developerExamples,
  admin: adminExamples
}; 