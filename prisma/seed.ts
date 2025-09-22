import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

async function main() {
  // Leer archivo Excel
  const workbook = XLSX.readFile("prisma/guest.xlsx");
  const sheetName = workbook.SheetNames[0];
  const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // data ahora es un arreglo de objetos { Nombre: "VALERIA PORTILLO", Grupo: "Familia Portillo" }

  for (const row of data) {
    const fullName = row.Nombre?.toString().trim();
    const groupName = row.Grupo?.toString().trim();

    if (!fullName) continue; // si no hay nombre, saltar

    let groupId: number | undefined = undefined;

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
