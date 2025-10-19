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
        const searchTerm = q.trim();
        // Función para normalizar texto (quitar tildes)
        const normalize = (text) => {
            return text
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
        };
        // Obtener TODOS los invitados
        const allGuests = await prisma_1.default.guest.findMany({
            include: { note: true },
        });
        // Filtrar en memoria con lógica inteligente
        const matchingGuests = allGuests.filter((guest) => {
            const normalizedFullName = normalize(guest.fullName);
            const normalizedSearch = normalize(searchTerm);
            // Dividir tanto el nombre completo como la búsqueda en palabras
            const nameParts = normalizedFullName.split(/\s+/);
            const searchParts = normalizedSearch.split(/\s+/);
            // Si la búsqueda tiene múltiples palabras (ej: "Martin Pocasangre")
            // verificar que TODAS las palabras de la búsqueda estén presentes como palabras completas
            if (searchParts.length > 1) {
                return searchParts.every(searchPart => nameParts.some(namePart => namePart === searchPart));
            }
            // Si es una sola palabra, debe coincidir EXACTAMENTE con alguna palabra del nombre
            // "Martin" solo encuentra "Martin", NO "Martinez"
            return nameParts.some(part => part === normalizedSearch);
        });
        if (matchingGuests.length === 0) {
            return res.json([]);
        }
        // Recopilar todos los IDs de grupos únicos
        const groupIds = [
            ...new Set(matchingGuests
                .map((g) => g.groupId)
                .filter((id) => typeof id === "number")),
        ];
        // Si hay grupos, traer TODOS los invitados de esos grupos
        if (groupIds.length > 0) {
            const allGroupMembers = await prisma_1.default.guest.findMany({
                where: { groupId: { in: groupIds } },
                include: { note: true },
            });
            return res.json(allGroupMembers);
        }
        // Si ninguno tiene grupo, devolver solo los que coinciden exactamente
        return res.json(matchingGuests);
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
    }
};
