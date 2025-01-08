-- CreateTable
CREATE TABLE "CodeExample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "certification" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeExample_certification_category_subcategory_language_key" ON "CodeExample"("certification", "category", "subcategory", "language");
