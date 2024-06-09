-- DropForeignKey
ALTER TABLE "song" DROP CONSTRAINT "song_album_id_fkey";

-- AlterTable
ALTER TABLE "song" ALTER COLUMN "album_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "song" ADD CONSTRAINT "song_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
