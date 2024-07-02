import prisma from '../config/prismaClient';
import { Request, Response } from 'express';
import { removeOldFile } from '../util/fileUtil';

// Todo: 1- create delete playlist function
// 2- istead if returning errors return status code with informative massege

export const create = async (req: Request, res: Response) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    // Create playlist
    const playlist = await prisma.playlist.create({
      data: { title: req.body.title, user_id: req.user.id, image: imagePath },
    });

    return res.status(200).json(playlist);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to create playlist' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = +req.params.id;

    // Check if playlist exist
    const old = await prisma.playlist.findUnique({ where: { id: +id } });
    if (!old) {
      return res.status(404).json({ e: 'Cant find playlist' });
    }
    const imagePath = req.file ? req.file.path : null;
    const updateImagePath = imagePath || old.image;

    // Update playlist
    const playlist = await prisma.playlist.update({
      where: { id, user_id: req.user.id },
      data: {
        title: req.body.title,
        image: updateImagePath,
      },
    });

    // If there is new imagepath then delete the old if it exist
    removeOldFile(imagePath, old.image);

    return res.status(200).json(playlist);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to update playlist' });
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const id = +req.params.id;

    // Get playlist
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      select: { playlist_song: { include: { song: true } } },
    });

    return res.status(200).json(playlist);
  } catch (e) {
    return res.status(404).json({ e: 'Failed to get playlist' });
  }
};

export const addSong = async (req: Request, res: Response) => {
  try {
    // Check if song exist
    const song = await prisma.song.findUnique({
      where: { id: +req.body.song_id },
    });

    if (!song) {
      return res.status(404).json({ e: 'No song' });
    }

    // Check if playlist exist
    const playlist = await prisma.playlist.findUnique({
      where: { id: +req.body.playlist_id, user_id: +req.user.id },
    });

    if (!playlist) {
      return res.status(404).json({ e: 'No playlist' });
    }

    // Check if song exist in playlist
    const existPlaylist_song = await prisma.playlist_song.findFirst({
      where: {
        playlist_id: +req.body.playlist_id,
        song_id: req.body.song_id,
      },
    });

    if (existPlaylist_song) {
      return res.status(400).json({ e: 'Song already in playlist' });
    }

    // Add song to playlist
    const playlist_song = await prisma.playlist_song.create({
      data: {
        song_id: +req.body.song_id,
        playlist_id: +req.body.playlist_id,
      },
    });
    return res.status(200).json(playlist_song);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to add song' });
  }
};

export const deleteSong = async (req: Request, res: Response) => {
  try {
    const { song_id, playlist_id } = req.body;
    // Check if playlist exist
    const playlist = await prisma.playlist.findUnique({
      where: { id: +playlist_id, user_id: +req.user.id },
    });

    if (!playlist) {
      return res.status(404).json({ e: 'No playlist' });
    }

    // Check if the song in playlist
    const check = await prisma.playlist_song.findUnique({
      where: {
        playlist_id_song_id: { playlist_id: +playlist_id, song_id: +song_id },
      },
    });

    if (!check) {
      return res.status(404).json({ e: 'Song not in playlist' });
    }

    // Delete song from playlist
    const playlist_song = await prisma.playlist_song.delete({
      where: {
        playlist_id_song_id: {
          playlist_id: +playlist_id,
          song_id: +song_id,
        },
      },
    });

    return res.status(200).json(playlist_song);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to delete song from playlist' });
  }
};
