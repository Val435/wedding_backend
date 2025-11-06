import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../config/cloudinary";
import { GalleryService } from "../services/gallery.service";
import { FileType } from "@prisma/client";
import fs from "fs";

export const GalleryController = {
  async uploadPhotos(req: Request, res: Response) {
    try {
      const { userName, message } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No se enviaron archivos",
        });
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Validar tipo de archivo
        const allowedMimeTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/heic",
          "image/webp",
          "video/mp4",
          "video/quicktime",
          "video/x-msvideo",
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          // Borrar archivo temporal
          fs.unlinkSync(file.path);
          continue; // Saltar archivo no válido
        }

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "wedding-gallery",
          resource_type: "auto",
          transformation:
            file.mimetype.startsWith("image/")
              ? [
                  {
                    width: 1920,
                    height: 1920,
                    crop: "limit",
                    quality: "auto",
                  },
                ]
              : [],
        });

        const fileType: FileType =
          result.resource_type === "video" ? FileType.video : FileType.image;

        // Generar thumbnail URL
        let thumbnailUrl: string;
        if (fileType === FileType.image) {
          thumbnailUrl = result.secure_url.replace(
            "/upload/",
            "/upload/w_400,h_400,c_fill/"
          );
        } else {
          // Para videos, tomar frame del segundo 0
          thumbnailUrl = result.secure_url.replace(
            "/upload/",
            "/upload/so_0,w_400,h_400,c_fill/"
          );
        }

        // Guardar en base de datos
        const photoData = {
          id: uuidv4(),
          fileUrl: result.secure_url,
          thumbnailUrl: thumbnailUrl,
          fileType: fileType,
          userName: userName || undefined,
          message: message || undefined,
          fileSize: result.bytes,
          mimeType: file.mimetype,
          width: result.width,
          height: result.height,
          duration: result.duration || undefined,
        };

        const savedPhoto = await GalleryService.createPhoto(photoData);

        uploadedFiles.push({
          id: savedPhoto.id,
          url: savedPhoto.fileUrl,
          thumbnailUrl: savedPhoto.thumbnailUrl,
          type: savedPhoto.fileType,
          userName: savedPhoto.userName,
          message: savedPhoto.message,
          uploadedAt: savedPhoto.uploadedAt,
        });

        // Borrar archivo temporal
        fs.unlinkSync(file.path);
      }

      if (uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Ningún archivo válido fue subido",
        });
      }

      res.json({
        success: true,
        message: "Archivos subidos exitosamente",
        uploadedCount: uploadedFiles.length,
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Error uploading:", error);
      res.status(500).json({
        success: false,
        error: "Error al subir archivos",
      });
    }
  },

  async getPhotos(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as FileType | undefined;

      // Validar tipo si se proporciona
      if (type && type !== FileType.image && type !== FileType.video) {
        return res.status(400).json({
          success: false,
          error: "Tipo inválido. Debe ser 'image' o 'video'",
        });
      }

      const { photos, total } = await GalleryService.getPhotos({
        limit,
        offset,
        type,
      });

      res.json({
        success: true,
        total,
        photos: photos.map((p) => ({
          id: p.id,
          url: p.fileUrl,
          thumbnailUrl: p.thumbnailUrl,
          type: p.fileType,
          userName: p.userName,
          message: p.message,
          uploadedAt: p.uploadedAt,
          width: p.width,
          height: p.height,
          duration: p.duration,
        })),
      });
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener galería",
      });
    }
  },

  async deletePhoto(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const photo = await GalleryService.getPhotoById(id);
      if (!photo) {
        return res.status(404).json({
          success: false,
          error: "Foto no encontrada",
        });
      }

      // Extraer public_id de Cloudinary desde la URL
      const urlParts = photo.fileUrl.split("/");
      const fileWithExt = urlParts[urlParts.length - 1];
      const publicId = `wedding-gallery/${fileWithExt.split(".")[0]}`;

      // Eliminar de Cloudinary
      await cloudinary.uploader.destroy(publicId, {
        resource_type: photo.fileType === FileType.video ? "video" : "image",
      });

      // Eliminar de la base de datos
      await GalleryService.deletePhoto(id);

      res.json({
        success: true,
        message: "Foto eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({
        success: false,
        error: "Error al eliminar foto",
      });
    }
  },
};
