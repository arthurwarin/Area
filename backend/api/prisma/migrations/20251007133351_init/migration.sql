/*
  Warnings:

  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."UserService" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Actions" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflows" (
    "id" SERIAL NOT NULL,
    "userId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Nodes" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "actionId" INTEGER NOT NULL,
    "prevId" INTEGER,

    CONSTRAINT "Nodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Services_name_key" ON "public"."Services"("name");

-- AddForeignKey
ALTER TABLE "public"."UserService" ADD CONSTRAINT "UserService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserService" ADD CONSTRAINT "UserService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Actions" ADD CONSTRAINT "Actions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflows" ADD CONSTRAINT "Workflows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nodes" ADD CONSTRAINT "Nodes_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nodes" ADD CONSTRAINT "Nodes_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "public"."Actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nodes" ADD CONSTRAINT "Nodes_prevId_fkey" FOREIGN KEY ("prevId") REFERENCES "public"."Nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
