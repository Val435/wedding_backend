import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando carga incremental de invitados...");

  const excelPath = path.join(__dirname, "guest.xlsx");

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ ERROR: No se encontró el archivo Excel en: ${excelPath}`);
    process.exit(1);
  }

  const XLSX = require("xlsx");
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  console.log(`📋 Encontradas ${data.length} filas en el Excel`);

  if (data.length === 0) {
    console.error("❌ ERROR: El archivo Excel está vacío o no tiene datos");
    process.exit(1);
  }

  // Track names processed in this run to avoid duplicates coming from the Excel file itself
  const processed = new Set<string>();

  let inserted = 0;
  let updated = 0;

  for (const row of data) {
    const rawName = row.Nombre ?? row.name ?? row.FullName;
    const rawGroup = row.Grupo ?? row.group ?? row.Group;

    const fullName = rawName?.toString().trim();
    const groupName = rawGroup?.toString().trim();

    if (!fullName) {
      console.log(`⚠️  Saltando fila sin nombre: ${JSON.stringify(row)}`);
      continue;
    }

    const nameKey = fullName.toLowerCase();
    if (processed.has(nameKey)) {
      console.log(`⚠️  Nombre repetido en Excel, saltando: ${fullName}`);
      continue;
    }
    processed.add(nameKey);

    // Find or create group
    let groupId: number | undefined = undefined;
    if (groupName) {
      let group = await prisma.group.findFirst({ where: { name: { equals: groupName } } });
      if (!group) {
        group = await prisma.group.create({ data: { name: groupName } });
        console.log(`➕ Grupo creado: ${groupName}`);
      }
      groupId = group.id;
    }

    // Try to find existing guest (case-insensitive where supported)
    const existing = await prisma.guest.findFirst({
      where: { fullName: { equals: fullName, mode: "insensitive" } },
    });

    if (existing) {
      // Optionally update the guest if groupId is now present but wasn't
      const needsUpdate = groupId && existing.groupId !== groupId;
      if (needsUpdate) {
        await prisma.guest.update({ where: { id: existing.id }, data: { groupId } });
        updated++;
        console.log(`🔁 Actualizado invitado: ${fullName} (asignado a grupo)`);
      } else {
        console.log(`↩️  Invitado ya existe, no se cambia: ${fullName}`);
      }
    } else {
      await prisma.guest.create({ data: { fullName, groupId } });
      inserted++;
      console.log(`➕ Invitado creado: ${fullName}`);
    }
  }

  console.log(`✅ Insertados: ${inserted}, actualizados: ${updated}`);
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
