import { Request, Response } from "express";
import { GuestService } from "../services/guest.service";
import prisma from "../utils/prisma";

export const GuestController = {
 // controllers/guest.controller.ts
async getGuests(req: Request, res: Response) {
  const { q } = req.query;

  if (!q) {
    const guests = await GuestService.findAll();
    return res.json(guests);
  }

  // Buscar invitado por nombre
  const found = await prisma.guest.findFirst({
    where: { fullName: { contains: q as string, mode: "insensitive" } },
  });

  if (!found) {
    return res.json([]);
  }

  // Si pertenece a un grupo, traer a todo el grupo
  if (found.groupId) {
    const group = await prisma.guest.findMany({
      where: { groupId: found.groupId },
      include: { note: true },
    });
    return res.json(group);
  }

  // Si no tiene grupo, devolver solo esa persona
  return res.json([found]);
},


  async createGuest(req: Request, res: Response) {
    const { fullName } = req.body;
    const guest = await GuestService.create(fullName);
    res.json(guest);
  },

  async confirmGuest(req: Request, res: Response) {
    const { id } = req.params;
    const { attending } = req.body;
    const guest = await GuestService.confirm(Number(id), attending);
    res.json(guest);
  },

  async addNote(req: Request, res: Response) {
    const { id } = req.params;
    const { message } = req.body;
    const guest = await GuestService.addNote(Number(id), message);
    res.json(guest);
  },

  async getNotes(req: Request, res: Response) {
  const notes = await GuestService.getNotes();
  res.json(notes);
}

};
