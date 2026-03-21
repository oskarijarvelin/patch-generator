/*
  Warnings:

  - Added the required column `slug` to the `Patch` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "designerName" TEXT NOT NULL,
    "designerEmail" TEXT,
    "designerPhone" TEXT,
    "designerCompany" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Patch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Patch" ("createdAt", "designerCompany", "designerEmail", "designerName", "designerPhone", "id", "notes", "slug", "title", "updatedAt", "userId") SELECT "createdAt", "designerCompany", "designerEmail", "designerName", "designerPhone", "id", "notes", "id", "title", "updatedAt", "userId" FROM "Patch";
DROP TABLE "Patch";
ALTER TABLE "new_Patch" RENAME TO "Patch";
CREATE UNIQUE INDEX "Patch_slug_key" ON "Patch"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
