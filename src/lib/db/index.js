import { PrismaClient } from '@prisma/client'

// Check if we're in production
const isProd = process.env.NODE_ENV === 'production'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}

export const prisma = globalForPrisma.prisma 