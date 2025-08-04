import { prisma } from "../config/prisma.config";
import { imageService } from "../services/image.service";
import cron from "node-cron";

/**
 * Untuk testing: run setiap 1 menit,
 * dan threshold = sekarang – 1 menit
 */
cron.schedule("0 3 * * *", async () => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - 7);

  // Cari semua post soft-deleted ≥1 menit lalu
  const posts = await prisma.post.findMany({
    where: {
      isDeleted: true,
      deletedAt: { lte: threshold },
    },
    select: { id: true },
  });

  for (const { id: postId } of posts) {
    // 1) Cari dan hapus semua image terkait yang sudah soft-deleted
    const images = await prisma.image.findMany({
      where: { postId, isDeleted: true },
      select: { id: true, url: true },
    });

    for (const img of images) {
      try {
        await imageService.deleteImageByPath(img.url);
        await prisma.image.delete({ where: { id: img.id } });
      } catch (err) {
        console.error(`Cleanup image error (${img.id}):`, err);
      }
    }

    // 2) Hard-delete post-nya
    try {
      await prisma.post.delete({ where: { id: postId } });
    } catch (err) {
      console.error(`Cleanup post error (${postId}):`, err);
    }
  }

  console.log(`Cleanup test run: processed ${posts.length} posts.`);
});
