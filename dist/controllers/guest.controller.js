"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestController = void 0;
const guest_service_1 = require("../services/guest.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
exports.GuestController = {
    // controllers/guest.controller.ts
    async getGuests(req, res) {
        const { q } = req.query;
        if (!q) {
            const guests = await guest_service_1.GuestService.findAll();
            return res.json(guests);
        }
        // Buscar invitado por nombre
        const found = await prisma_1.default.guest.findFirst({
            where: { fullName: { contains: q, mode: "insensitive" } },
        });
        if (!found) {
            return res.json([]);
        }
        // Si pertenece a un grupo, traer a todo el grupo
        if (found.groupId) {
            const group = await prisma_1.default.guest.findMany({
                where: { groupId: found.groupId },
                include: { note: true },
            });
            return res.json(group);
        }
        // Si no tiene grupo, devolver solo esa persona
        return res.json([found]);
    },
    async createGuest(req, res) {
        const { fullName } = req.body;
        const guest = await guest_service_1.GuestService.create(fullName);
        res.json(guest);
    },
    async confirmGuest(req, res) {
        const { id } = req.params;
        const { attending } = req.body;
        const guest = await guest_service_1.GuestService.confirm(Number(id), attending);
        res.json(guest);
    },
    async addNote(req, res) {
        const { id } = req.params;
        const { message } = req.body;
        const guest = await guest_service_1.GuestService.addNote(Number(id), message);
        res.json(guest);
    },
    async getNotes(req, res) {
        const notes = await guest_service_1.GuestService.getNotes();
        res.json(notes);
    },
};
