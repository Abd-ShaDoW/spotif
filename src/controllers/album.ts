import prisma from '../config/prismaClient';
import { Request, Response } from 'express';
import client from '../config/elasticsearchClient';

export const create = async (req: Request, res: Response) => {
  try {
    // Image path
    const imagePath = req.file ? req.file.path : null;

    // Create album
    const album = await prisma.album.create({
      data: {
        title: req.body.title,
        artist_id: req.artist.id,
        image: imagePath,
      },
      include: { artist: { select: { name: true } } },
    });

    // Create album index in elastic
    const elastic = await client.index({
      index: 'albums',
      id: album.id.toString(),
      body: {
        title: album.title,
        artist: { id: album.artist_id, name: album.artist.name },
        image: album.image,
      },
    });
    return res.status(201).json({ album, elastic });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ e: 'Failed to create album' });
  }
};

export const get = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get album
    const album = await prisma.album.findUnique({
      where: { id: +id },
      select: { song: true },
    });

    // Get album from elastic
    const elastic = await client.get({
      index: 'albums',
      id: id.toString(),
    });

    return res.status(200).json({ album, elastic });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to get album' });
  }
};
