-- CreateTable
CREATE TABLE "public"."Guide" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'The Property Portfolio Podcast',
    "link" TEXT NOT NULL,
    "language" TEXT[],
    "thumbnail" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "size" INTEGER,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guide_uuid_key" ON "public"."Guide"("uuid");
