import { Router } from "express";
import { GalleryController } from "../controllers/gallery.controller";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// POST /gallery/upload - Subir fotos/videos (máximo 15 por subida)
router.post("/upload", upload.array("files", 15), GalleryController.uploadPhotos);

// GET /gallery/photos - Obtener todas las fotos/videos
router.get("/photos", GalleryController.getPhotos);

// DELETE /gallery/photos/:id - Eliminar una foto/video (opcional)
router.delete("/photos/:id", GalleryController.deletePhoto);

export default router;
