import prisma from '../config/prismaClient';
import { Request, Response } from 'express';
import client from '../config/elasticsearchClient';
import { removeOldFile } from '../util/fileUtil';

// Todo: istead if returning errors return status code with informative massege

export const create = async (req: Request, res: Response) => {
  try {
    const songPath = req.file ? req.file.path : null;

    if (!songPath) {
      return res.status(400).json({ e: 'File path is missing ' });
    }

    // Create song
    const song = await prisma.song.create({
      data: {
        Title: req.body.Title,
        song_content: songPath,
        album_id: +req.body.album_id,
        song_artist: {
          create: { artist: { connect: { id: +req.artist.id } } },
        },
      },
      include: {
        song_artist: {
          include: {
            artist: true,
          },
        },
      },
    });

    // Create song in elasticsearch
    const elastic = await client.index({
      index: 'songs',
      id: song.id.toString(),
      body: {
        title: song.Title,
        content: song.song_content,
        album_id: song.album_id,
        artist: song.song_artist.map((sa) => ({
          id: sa.artist.id,
          name: sa.artist.name,
        })),
      },
    });

    return res.status(201).json({ song, elastic });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to create song' });
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const id = +req.params.id;

    // Get song
    const song = await prisma.song.findUnique({
      where: {
        id,
      },
      include: {
        album: true,
        song_artist: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                image: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Get song from elasticsearch
    const elastic = await client.get({
      index: 'songs',
      id: id.toString(),
    });

    return res.status(200).json({ song, elastic });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to get song' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Title, album_id } = req.body;

    // Check if song exist
    const old = await prisma.song.findUnique({
      where: { id: +id },
      include: {
        song_artist: {
          where: { artist_id: req.artist.id },
        },
      },
    });

    if (!old || old.song_artist.length === 0) {
      return res.status(403).json({ e: 'You are not authorized' });
    }

    const imagePath = req.file ? req.file.path : null;
    const updateImagePath = imagePath || old.image;

    // If there is album_id then check if it exists
    if (album_id) {
      const album = await prisma.album.findUnique({
        where: { id: +album_id },
        select: { artist_id: true },
      });

      if (!album || album.artist_id !== req.artist.id) {
        return res.status(403).json({ e: 'You are not authorized' });
      }
    }

    // Update song
    const song = await prisma.song.update({
      where: { id: +id },
      data: { Title: Title, album_id: +album_id, image: updateImagePath },
      include: {
        song_artist: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update Elasticsearch document if there are any changes
    const elastic = await client.update({
      index: 'songs',
      id: id.toString(),
      body: {
        doc: {
          title: song.Title,
          album_id: song.album_id,
          image: song.image,
          artist: song.song_artist.map((sa) => ({
            id: sa.artist.id,
            name: sa.artist.name,
          })),
        },
      },
    });

    // Function to update album songs in Elasticsearch
    const updateAlbumSongs = async (albumId: number) => {
      const songs = await prisma.song.findMany({
        where: { album_id: +albumId },
        select: { id: true, Title: true, image: true },
      });

      await client.update({
        index: 'albums',
        id: albumId.toString(),
        body: {
          doc: {
            songs: songs.map((song) => ({
              id: song.id,
              title: song.Title,
              image: song.image,
            })),
          },
        },
      });
    };

    // Update albums in elasticsearch if album_id has changed
    if (album_id !== undefined && album_id !== old.album_id) {
      // Update the old album to remove the song
      if (old.album_id) {
        await updateAlbumSongs(old.album_id);
      }
      // Update the new album to add the song
      if (album_id) {
        await updateAlbumSongs(album_id);
      }
    }

    // If there is new imagepath then delete the old if it exist
    removeOldFile(imagePath, old.image);

    return res.status(200).json({ song, elastic });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ e: 'Failed to update song' });
  }
};

export const addArtist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { artist_id } = req.body;

    // Find song
    const song = await prisma.song.findUnique({
      where: {
        id: +id,
      },
      include: {
        song_artist: {
          where: {
            artist_id: req.artist.id,
          },
        },
      },
    });

    if (!song || song.song_artist.length === 0) {
      return res.status(403).json({ e: 'You are not authorized' });
    }

    // Add artist to song
    const addArtist = await prisma.song_artist.create({
      data: {
        song_id: +id,
        artist_id: +artist_id,
      },
    });

    // Fetch song data
    const updatedSong = await prisma.song.findUnique({
      where: { id: +id },
      include: {
        song_artist: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update the song with the new artist
    const elastic = await client.update({
      index: 'songs',
      id: id.toString(),
      body: {
        doc: {
          artist: updatedSong.song_artist.map((sa) => ({
            id: sa.artist.id,
            name: sa.artist.name,
          })),
        },
      },
    });

    return res.status(201).json({ addArtist, elastic });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to add artist' });
  }
};

export const addFavorite = async (req: Request, res: Response) => {
  try {
    // Find song
    const song = await prisma.song.findUnique({
      where: { id: +req.body.song_id },
    });

    if (!song) {
      return res.status(404).json({ e: 'Failed to find song' });
    }

    const user = +req.user.id;

    // Check if song already in favorite
    const find = await prisma.favorite.findFirst({
      where: {
        song_id: +req.body.song_id,
        user_id: +user,
      },
    });

    if (find) {
      return res.json({ e: 'Song already in favorite' });
    }

    // Add song to favorite
    const favorite = await prisma.favorite.create({
      data: {
        user_id: +user,
        song_id: +req.body.song_id,
      },
    });
    return res.status(200).json(favorite);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to add to favorite' });
  }
};

export const unfavorite = async (req: Request, res: Response) => {
  try {
    // Find song in favorite
    const find = await prisma.favorite.findFirst({
      where: { user_id: +req.user.id, song_id: +req.body.song_id },
    });

    if (!find) {
      return res.status(404).json({ e: 'Cant find favorite' });
    }

    // Delete song from favortie
    const favorite = await prisma.favorite.delete({
      where: {
        user_id_song_id: {
          user_id: +req.user.id,
          song_id: +req.body.song_id,
        },
      },
    });
    return res.status(200).json(favorite);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to remove favorite' });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const user = req.user.id;

    // Get all favorite with user_id
    const favorite = await prisma.favorite.findMany({
      where: { user_id: +user },
    });

    return res.status(200).json(favorite);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to get favorites' });
  }
};
