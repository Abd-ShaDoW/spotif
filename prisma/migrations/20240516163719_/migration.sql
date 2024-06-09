/*
  Warnings:

  - You are about to drop the column `releaseYear` on the `album` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "album" DROP COLUMN "releaseYear",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
