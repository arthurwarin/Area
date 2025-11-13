/*
  Warnings:

  - You are about to drop the column `type` on the `Actions` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Reactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Actions" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Reactions" DROP COLUMN "type";
