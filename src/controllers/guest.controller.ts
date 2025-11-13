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

  const searchTerm = (q as string).trim();

  if (!searchTerm) {
    const guests = await GuestService.findAll();
    return res.json(guests);
  }

  // Función para normalizar texto (quitar tildes)
  const normalize = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Tokenizador: separa por caracteres no alfanuméricos
  const tokenize = (text: string) =>
    text.replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);

  // Obtener TODOS los invitados
  const allGuests = await prisma.guest.findMany({
    include: { note: true },
  });

  // Filtrar en memoria con lógica inteligente
  const matchingGuests = allGuests.filter((guest: any) => {
    const normalizedFullName = normalize(guest.fullName);
    const normalizedSearch = normalize(searchTerm);

    // Dividir tanto el nombre completo como la búsqueda en palabras
    const nameParts = tokenize(normalizedFullName);
    const searchParts = tokenize(normalizedSearch);

    // Si la búsqueda tiene múltiples palabras (ej: "Martin Pocasangre")
    // verificar que TODAS las palabras de la búsqueda estén presentes como palabras completas
    if (searchParts.length > 1) {
      return searchParts.every(searchPart =>
        nameParts.some(namePart => namePart === searchPart)
      );
    }

    // Si es una sola palabra, debe coincidir EXACTAMENTE con alguna palabra del nombre
    // "Martin" solo encuentra "Martin", NO "Martinez"
    return nameParts.some(part => part === searchParts[0]);
  });

  if (matchingGuests.length === 0) {
    return res.json([]);
  }

  // Recopilar todos los IDs de grupos únicos
  const groupIds = [
    ...new Set(
      matchingGuests
        .map((g: any) => g.groupId)
        .filter((id: any) => typeof id === "number")
    ),
  ] as number[];

  // Si hay grupos, traer TODOS los invitados de esos grupos
  if (groupIds.length > 0) {
    const allGroupMembers = await prisma.guest.findMany({
      where: { groupId: { in: groupIds } },
      include: { note: true },
    });

    // Incluir también los que coinciden y NO tienen grupo
    const noGroupMatches = matchingGuests.filter((g: any) => g.groupId == null);
    if (noGroupMatches.length === 0) {
      return res.json(allGroupMembers);
    }

    const mergedById = new Map<number, any>();
    for (const g of allGroupMembers) mergedById.set(g.id, g);
    for (const g of noGroupMatches) mergedById.set(g.id, g);
    return res.json(Array.from(mergedById.values()));
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
    const { attending, foodPreference } = req.body;
    const guest = await GuestService.confirm(Number(id), attending, foodPreference);
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
