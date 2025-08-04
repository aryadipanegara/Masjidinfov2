-- AlterTable
ALTER TABLE "post" ADD COLUMN     "bookmark_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "country_code" TEXT NOT NULL DEFAULT 'ALL',
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;
