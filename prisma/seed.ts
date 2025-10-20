import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando sincronización de base de datos con Excel...");

  // 1. Limpiar todos los datos existentes
  console.log("🗑️  Limpiando datos existentes...");
  await prisma.guest.deleteMany({});
  await prisma.group.deleteMany({});
  console.log("✅ Datos anteriores eliminados");

  // 2. Leer archivo Excel
  console.log("📊 Leyendo archivo Excel...");
  const workbook = XLSX.readFile("prisma/guest.xlsx");
  const sheetName = workbook.SheetNames[0];
  const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 1 });
  console.log(`📋 Encontradas ${data.length} filas en el Excel`);

  // 3. Insertar nuevos datos
  let guestCount = 0;
  const groupsMap = new Map<string, number>(); // Cache de grupos creados

  for (const row of data) {
    const fullName = row.Nombre?.toString().trim();
    const groupName = row.Grupo?.toString().trim();

    if (!fullName) continue; // si no hay nombre, saltar

    let groupId: number | undefined = undefined;

    if (groupName) {
      // Verificar si el grupo ya está en el cache
      if (groupsMap.has(groupName)) {
        groupId = groupsMap.get(groupName)!; // El ! indica que sabemos que no es undefined
      } else {
        // Crear grupo y agregarlo al cache
        const group = await prisma.group.create({
          data: { name: groupName }
        });
        groupId = group.id;
        groupsMap.set(groupName, groupId);
      }
    }

    // Insertar invitado
    await prisma.guest.create({
      data: {
        fullName,
        groupId,
      },
    });
    guestCount++;
  }

  console.log(`✅ ${guestCount} invitados insertados desde Excel!`);
  console.log(`✅ ${groupsMap.size} grupos creados!`);
  console.log("🎉 Sincronización completada exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
