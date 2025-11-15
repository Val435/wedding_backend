import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Reseteando confirmaciones de invitados...");

  // 1. Borrar todas las notas
  console.log("🗑️  Borrando notas...");
  await prisma.note.deleteMany({});
  console.log("✅ Notas eliminadas");

  // 2. Resetear campos de confirmación de todos los invitados
  console.log("🔄 Reseteando confirmaciones...");
  await prisma.guest.updateMany({
    data: {
      attending: null,
      confirmedAt: null,
      foodPreference: null,
      noteId: null,
    },
  });
  console.log("✅ Confirmaciones reseteadas");

  const totalGuests = await prisma.guest.count();
  console.log(`📋 Total de invitados en la base de datos: ${totalGuests}`);
  console.log("🎉 Reseteo completado exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
