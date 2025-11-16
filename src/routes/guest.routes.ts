import { Router } from "express";
import { GuestController } from "../controllers/guest.controller";
import { searchLimiter, confirmLimiter, createGuestLimiter } from "../middleware/rate-limit.middleware";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Rutas públicas (para invitados)
router.get("/", searchLimiter, GuestController.getGuests); // Búsqueda de invitados (pública)
router.put("/:id/confirm", confirmLimiter, GuestController.confirmGuest); // Confirmar asistencia (pública)
router.post("/:id/note", confirmLimiter, GuestController.addNote); // Agregar nota (pública)

// Rutas protegidas (solo admin)
router.get("/notes/all", authenticateToken, searchLimiter, GuestController.getNotes); // Ver todas las notas (admin)
router.post("/", authenticateToken, createGuestLimiter, GuestController.createGuest); // Crear invitado (admin)

export default router;
