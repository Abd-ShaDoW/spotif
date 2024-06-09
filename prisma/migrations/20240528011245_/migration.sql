/*
  Warnings:

  - The primary key for the `playlist_song` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `playlist_song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "playlist_song" DROP CONSTRAINT "playlist_song_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "playlist_song_pkey" PRIMARY KEY ("playlist_id", "song_id");
