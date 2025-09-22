"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const XLSX = __importStar(require("xlsx"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Leer archivo Excel
    const workbook = XLSX.readFile("prisma/guest.xlsx");
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    // data ahora es un arreglo de objetos { Nombre: "VALERIA PORTILLO", Grupo: "Familia Portillo" }
    for (const row of data) {
        const fullName = row.Nombre?.toString().trim();
        const groupName = row.Grupo?.toString().trim();
        if (!fullName)
            continue; // si no hay nombre, saltar
        let groupId = undefined;
        if (groupName) {
            // crear grupo si no existe
            let group = await prisma.group.findFirst({ where: { name: groupName } });
            if (!group) {
                group = await prisma.group.create({ data: { name: groupName } });
            }
            groupId = group.id;
        }
        // insertar invitado
        await prisma.guest.create({
            data: {
                fullName,
                groupId,
            },
        });
    }
    console.log("✅ Invitados insertados desde Excel!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
