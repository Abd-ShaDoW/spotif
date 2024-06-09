/*
  Warnings:

  - A unique constraint covering the columns `[emailConfirmationToken]` on the table `artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `artist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "artist" ADD COLUMN     "emailConfirmationToken" TEXT,
ADD COLUMN     "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordResetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "artist_emailConfirmationToken_key" ON "artist"("emailConfirmationToken");

-- CreateIndex
CREATE UNIQUE INDEX "artist_passwordResetToken_key" ON "artist"("passwordResetToken");
