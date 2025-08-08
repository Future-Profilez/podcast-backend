-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Podcast" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "langauage" TEXT[],
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL DEFAULT 'The Property Portfolio Podcast',
    "cast" TEXT[],

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Episode" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "durationInSec" INTEGER NOT NULL,
    "link" TEXT,
    "thumbnail" TEXT NOT NULL,
    "mimefield" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "podcastId" INTEGER NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_uuid_key" ON "public"."Podcast"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_name_key" ON "public"."Podcast"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_uuid_key" ON "public"."Episode"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_email_key" ON "public"."subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contact_email_key" ON "public"."contact"("email");

-- AddForeignKey
ALTER TABLE "public"."Episode" ADD CONSTRAINT "Episode_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "public"."Podcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
