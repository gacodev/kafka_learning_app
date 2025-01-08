/*
  Warnings:

  - You are about to drop the column `description` on the `CodeExample` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `CodeExample` table. All the data in the column will be lost.
  - Added the required column `type` to the `CodeExample` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CodeExample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CodeExample" ("category", "certification", "code", "createdAt", "explanation", "id", "language", "subcategory", "updatedAt") SELECT "category", "certification", "code", "createdAt", "explanation", "id", "language", "subcategory", "updatedAt" FROM "CodeExample";
DROP TABLE "CodeExample";
ALTER TABLE "new_CodeExample" RENAME TO "CodeExample";
CREATE UNIQUE INDEX "CodeExample_type_category_subcategory_language_key" ON "CodeExample"("type", "category", "subcategory", "language");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
