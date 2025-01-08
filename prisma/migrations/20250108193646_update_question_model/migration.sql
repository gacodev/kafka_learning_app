/*
  Warnings:

  - You are about to drop the column `lastReviewDate` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `nextReviewDate` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `successRate` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `timesReviewed` on the `Question` table. All the data in the column will be lost.
  - Added the required column `category` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionsJson` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "optionsJson" TEXT NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "topic" TEXT,
    "subtopicsJson" TEXT,
    "category" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "answer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Question" ("answer", "certification", "content", "createdAt", "id", "topic", "updatedAt") SELECT "answer", "certification", "content", "createdAt", "id", "topic", "updatedAt" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
