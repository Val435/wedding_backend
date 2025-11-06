-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('image', 'video');

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "thumbnailUrl" VARCHAR(500),
    "fileType" "FileType" NOT NULL,
    "userName" VARCHAR(100),
    "message" TEXT,
    "fileSize" INTEGER,
    "mimeType" VARCHAR(50),
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryPhoto_fileType_idx" ON "GalleryPhoto"("fileType");

-- CreateIndex
CREATE INDEX "GalleryPhoto_uploadedAt_idx" ON "GalleryPhoto"("uploadedAt" DESC);
