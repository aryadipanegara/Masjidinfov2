-- AlterTable
ALTER TABLE "image" ADD COLUMN     "uploaded_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
