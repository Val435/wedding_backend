import prisma from "../utils/prisma";

export const GuestService = {
  async findAll(q?: string) {
    return prisma.guest.findMany({
      where: q ? { fullName: { contains: q, mode: "insensitive" } } : {},
      include: { note: true },
    });
  },

  async create(fullName: string) {
    return prisma.guest.create({ data: { fullName } });
  },

  async confirm(id: number, attending: boolean) {
    return prisma.guest.update({
      where: { id },
      data: { attending, confirmedAt: new Date() },
    });
  },

  async addNote(id: number, message: string) {
    const note = await prisma.note.create({ data: { message } });
    return prisma.guest.update({
      where: { id },
      data: { noteId: note.id },
      include: { note: true },
    });
  },

  async getNotes() {
    return prisma.note.findMany({ orderBy: { createdAt: "desc" } });
  },
};
