/*
  Warnings:

  - You are about to drop the column `prevId` on the `Nodes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Nodes" DROP CONSTRAINT "Nodes_prevId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Nodes" DROP CONSTRAINT "Nodes_workflowId_fkey";

-- AlterTable
ALTER TABLE "Actions" ADD COLUMN     "data" TEXT[];

-- AlterTable
ALTER TABLE "Nodes" DROP COLUMN "prevId",
ADD COLUMN     "data" TEXT[],
ADD COLUMN     "nextId" INTEGER;

-- AlterTable
ALTER TABLE "Workflows" ALTER COLUMN "userId" DROP DEFAULT;
DROP SEQUENCE "Workflows_userId_seq";

-- AddForeignKey
ALTER TABLE "Nodes" ADD CONSTRAINT "Nodes_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nodes" ADD CONSTRAINT "Nodes_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "Nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
