/*
  Warnings:

  - You are about to drop the column `langauage` on the `Podcast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Podcast" DROP COLUMN "langauage",
ADD COLUMN     "language" TEXT[];
