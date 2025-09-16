-- AlterTable
ALTER TABLE "public"."Episode" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Podcast" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
