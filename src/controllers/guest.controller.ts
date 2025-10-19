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

  // Buscar TODOS los invitados con ese nombre EXACTO (case-insensitive)
  const matchingGuests = await prisma.guest.findMany({
    where: { fullName: { equals: q as string, mode: "insensitive" } },
    include: { note: true },
  });

  if (matchingGuests.length === 0) {
    return res.json([]);
  }

  // Recopilar todos los IDs de grupos únicos
  const groupIds = [...new Set(matchingGuests.map(g => g.groupId).filter(id => id !== null))];

  // Si hay grupos, traer TODOS los invitados de esos grupos
  if (groupIds.length > 0) {
    const allGroupMembers = await prisma.guest.findMany({
      where: { groupId: { in: groupIds } },
      include: { note: true },
    });
    return res.json(allGroupMembers);
  }

  // Si ninguno tiene grupo, devolver solo los que coinciden exactamente
  return res.json(matchingGuests);
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
