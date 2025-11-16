import { Router } from "express";
import { GalleryController } from "../controllers/gallery.controller";
import { upload } from "../middleware/upload.middleware";
import { uploadLimiter, galleryViewLimiter, confirmLimiter } from "../middleware/rate-limit.middleware";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Rutas públicas
// POST /gallery/upload - Subir fotos/videos (máximo 15 por subida)
router.post("/upload", uploadLimiter, upload.array("files", 15), GalleryController.uploadPhotos);

// GET /gallery/photos - Obtener todas las fotos/videos
router.get("/photos", galleryViewLimiter, GalleryController.getPhotos);

// Rutas protegidas (solo admin)
// DELETE /gallery/photos/:id - Eliminar una foto/video
router.delete("/photos/:id", authenticateToken, confirmLimiter, GalleryController.deletePhoto);

export default router;
