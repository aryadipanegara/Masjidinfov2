import prisma from "../src/prisma/client";

async function clearDatabase() {
  try {
    await prisma.$transaction([
      prisma.comment.deleteMany(),
      prisma.image.deleteMany(),
      prisma.post.deleteMany(),
      prisma.masjid.deleteMany(),
    ]);

    console.log("✅ Semua data berhasil dihapus dari database.");
  } catch (err) {
    console.error("❌ Gagal menghapus data:", err);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
