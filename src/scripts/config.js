import { PrismaClient } from '@prisma/client';
import path from 'path';

export const prisma = new PrismaClient();
export const QUESTIONS_DIR = path.join(process.cwd(), '.'); 