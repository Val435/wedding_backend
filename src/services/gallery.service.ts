import prisma from "../utils/prisma";
import { FileType } from "@prisma/client";

interface CreatePhotoData {
  id: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: FileType;
  userName?: string;
  message?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export const GalleryService = {
  async createPhoto(data: CreatePhotoData) {
    return await prisma.galleryPhoto.create({
      data: {
        id: data.id,
        fileUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl,
        fileType: data.fileType,
        userName: data.userName,
        message: data.message,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        width: data.width,
        height: data.height,
        duration: data.duration,
      },
    });
  },

  async getPhotos(options?: {
    limit?: number;
    offset?: number;
    type?: FileType;
  }) {
    const { limit = 100, offset = 0, type } = options || {};

    const where = {
      isApproved: true,
      ...(type && { fileType: type }),
    };

    const [photos, total] = await Promise.all([
      prisma.galleryPhoto.findMany({
        where,
        orderBy: { uploadedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.galleryPhoto.count({ where }),
    ]);

    return { photos, total };
  },

  async getPhotoById(id: string) {
    return await prisma.galleryPhoto.findUnique({
      where: { id },
    });
  },

  async deletePhoto(id: string) {
    return await prisma.galleryPhoto.delete({
      where: { id },
    });
  },

  async updateApproval(id: string, isApproved: boolean) {
    return await prisma.galleryPhoto.update({
      where: { id },
      data: { isApproved },
    });
  },
};
