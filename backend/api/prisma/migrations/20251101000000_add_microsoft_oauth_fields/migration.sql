-- AlterTable
ALTER TABLE "Users" ADD COLUMN "name" TEXT,
ADD COLUMN "microsoftId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_microsoftId_key" ON "Users"("microsoftId");
