CREATE TABLE IF NOT EXISTS "apikey" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "start" TEXT,
    "prefix" TEXT,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
);
