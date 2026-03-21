-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Fixture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manufacturer" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "powerConsumption" REAL NOT NULL,
    "symbolUrl" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    CONSTRAINT "Fixture_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FixtureMode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "channelCount" INTEGER NOT NULL,
    "fixtureId" TEXT NOT NULL,
    CONSTRAINT "FixtureMode_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patch" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

-- CreateTable
CREATE TABLE "PatchGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "position" TEXT NOT NULL,
    "universe" TEXT NOT NULL,
    "startingId" INTEGER NOT NULL,
    "startingAddress" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "patchId" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "modeId" TEXT NOT NULL,
    CONSTRAINT "PatchGroup_patchId_fkey" FOREIGN KEY ("patchId") REFERENCES "Patch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PatchGroup_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PatchGroup_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "FixtureMode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
