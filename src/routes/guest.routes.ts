import { Router } from "express";
import { GuestController } from "../controllers/guest.controller";

const router = Router();

router.get("/", GuestController.getGuests);
router.post("/", GuestController.createGuest);
router.put("/:id/confirm", GuestController.confirmGuest);
router.post("/:id/note", GuestController.addNote);
router.get("/notes/all", GuestController.getNotes);

export default router;
