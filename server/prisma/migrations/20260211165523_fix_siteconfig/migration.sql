/*
  Warnings:

  - The primary key for the `site_config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `site_config` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "site_config_key_key";

-- AlterTable
ALTER TABLE "site_config" DROP CONSTRAINT "site_config_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "site_config_pkey" PRIMARY KEY ("key");
