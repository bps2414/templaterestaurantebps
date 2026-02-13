/*
  Warnings:

  - A unique constraint covering the columns `[refreshTokenHash]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Made the column `refreshTokenHash` on table `sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- Purge existing sessions that may have NULL refreshTokenHash
-- Users will simply re-login after this migration
DELETE FROM "sessions" WHERE "refreshTokenHash" IS NULL;

-- DropIndex
DROP INDEX "sessions_refreshToken_key";

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "refreshTokenHash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshTokenHash_key" ON "sessions"("refreshTokenHash");
