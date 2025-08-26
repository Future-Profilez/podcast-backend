/*
  Warnings:

  - You are about to drop the column `size` on the `Guide` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Guide" DROP COLUMN "size",
ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pages" INTEGER;
