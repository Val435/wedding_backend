import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando carga de invitados...");

  // Verificar si el archivo Excel existe
  const excelPath = path.join(__dirname, "guest.xlsx");

  if (!fs.existsSync(excelPath)) {
    console.error(`❌ ERROR: No se encontró el archivo Excel en: ${excelPath}`);
    console.error(`📂 Archivos en el directorio prisma/:`);
    const files = fs.readdirSync(__dirname);
    files.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }

  console.log(`✅ Archivo Excel encontrado: ${excelPath}`);

  // Importar xlsx solo si el archivo existe
  const XLSX = require("xlsx");

  // 1. Limpiar datos existentes
  console.log("🗑️  Limpiando datos existentes...");
  await prisma.note.deleteMany({});
  await prisma.guest.deleteMany({});
  await prisma.group.deleteMany({});
  console.log("✅ Datos anteriores eliminados");

  // 2. Leer archivo Excel
  console.log("📊 Leyendo archivo Excel...");
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log(`📋 Encontradas ${data.length} filas en el Excel`);

  if (data.length === 0) {
    console.error("❌ ERROR: El archivo Excel está vacío o no tiene datos");
    process.exit(1);
  }

  // 3. Insertar nuevos datos
  let guestCount = 0;
  const groupsMap = new Map<string, number>();

  for (const row of data) {
    const fullName = row.Nombre?.toString().trim();
    const groupName = row.Grupo?.toString().trim();

    if (!fullName) {
      console.log(`⚠️  Saltando fila sin nombre: ${JSON.stringify(row)}`);
      continue;
    }

    let groupId: number | undefined = undefined;

    if (groupName) {
      if (groupsMap.has(groupName)) {
        groupId = groupsMap.get(groupName)!;
      } else {
        const group = await prisma.group.create({
          data: { name: groupName }
        });
        groupId = group.id;
        groupsMap.set(groupName, groupId);
        console.log(`➕ Grupo creado: ${groupName}`);
      }
    }

    await prisma.guest.create({
      data: {
        fullName,
        groupId,
      },
    });
    guestCount++;

    if (guestCount % 10 === 0) {
      console.log(`   ... ${guestCount} invitados insertados`);
    }
  }

  console.log(`✅ ${guestCount} invitados insertados desde Excel!`);
  console.log(`✅ ${groupsMap.size} grupos creados!`);
  console.log("🎉 Sincronización completada exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
