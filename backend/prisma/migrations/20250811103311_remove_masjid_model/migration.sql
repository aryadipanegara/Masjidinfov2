/*
  Warnings:

  - You are about to drop the `masjid` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "masjid" DROP CONSTRAINT "masjid_post_id_fkey";

-- DropTable
DROP TABLE "masjid";
