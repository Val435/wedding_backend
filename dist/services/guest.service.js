"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
exports.GuestService = {
    async findAll(q) {
        return prisma_1.default.guest.findMany({
            where: q ? { fullName: { contains: q, mode: "insensitive" } } : {},
            include: { note: true },
        });
    },
    async create(fullName) {
        return prisma_1.default.guest.create({ data: { fullName } });
    },
    async confirm(id, attending, foodPreference) {
        return prisma_1.default.guest.update({
            where: { id },
            data: {
                attending,
                confirmedAt: new Date(),
                ...(foodPreference && { foodPreference })
            },
        });
    },
    async addNote(id, message) {
        const note = await prisma_1.default.note.create({ data: { message } });
        return prisma_1.default.guest.update({
            where: { id },
            data: { noteId: note.id },
            include: { note: true },
        });
    },
    async getNotes() {
        return prisma_1.default.note.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                guest: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });
    }
};
