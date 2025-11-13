/*
  Warnings:

  - You are about to drop the `Nodes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `actionId` to the `Workflows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reactionId` to the `Workflows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Nodes" DROP CONSTRAINT "Nodes_actionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Nodes" DROP CONSTRAINT "Nodes_nextId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Nodes" DROP CONSTRAINT "Nodes_workflowId_fkey";

-- AlterTable
ALTER TABLE "Workflows" ADD COLUMN     "actionId" INTEGER NOT NULL,
ADD COLUMN     "reactionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Nodes";

-- CreateTable
CREATE TABLE "Reactions" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" TEXT[],

    CONSTRAINT "Reactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reactions" ADD CONSTRAINT "Reactions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflows" ADD CONSTRAINT "Workflows_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflows" ADD CONSTRAINT "Workflows_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
