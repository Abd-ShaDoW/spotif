import prisma from '../config/prismaClient';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import {
  sendEmailConfirmation,
  sendPasswordResetEmail,
} from '../util/emailUtil';
import { EntityType } from '../entity/userTypes';
import { generateToken } from '../helpers/token';
import { authSchema, passwordResetSchema } from '../helpers/validate';
import client from '../config/elasticsearchClient';
import { removeOldFile } from '../util/fileUtil';

//// Todo: istead if returning errors return status code with informative massege

export const signUp = async (req: Request, res: Response) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    // Validation
    const result = await authSchema.validateAsync(req.body);

    // Check if email already used as artist
    const used = await prisma.artist.findFirst({
      where: { email: result.email },
    });

    if (used) {
      return res.status(409).json({ e: 'email already used' });
    }

    const emailConfirmationToken = generateToken();

    // Create artist
    const artist = await prisma.artist.create({
      data: {
        email: result.email,
        name: result.name,
        password: await bcrypt.hash(result.password, 10),
        emailConfirmationToken,
        image: imagePath,
      },
    });

    // Create artist in elastic
    const elastic = await client.index({
      index: 'artists',
      id: artist.id.toString(),
      body: {
        name: artist.name,
        image: artist.image,
      },
    });

    // Send email to the artist to confirm
    await sendEmailConfirmation(
      result.email,
      emailConfirmationToken,
      EntityType.Artist
    );

    return res.status(201).json({ artist, elastic });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ e: 'Failed to signup' });
  }
};

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    // Find the artist using the token
    const artist = await prisma.artist.findUnique({
      where: { emailConfirmationToken: token as string },
    });

    if (!artist) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update the artist to make his email verified
    await prisma.artist.update({
      where: { id: artist.id },
      data: {
        emailConfirmed: true,
        emailConfirmationToken: null,
      },
    });

    res.status(200).json({ message: 'Email confirmed' });
  } catch (error) {
    res.status(500).json({ error: 'Email confirmation failed' });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw Error('Please provide email and password');
    }

    // Find artist
    const artist = await prisma.artist.findFirst({
      where: { email: req.body.email },
    });

    if (!artist) {
      return new Error('invalid credentials');
    }

    // Compare passwords
    const compare = await bcrypt.compare(password, artist.password);
    if (!compare) {
      return new Error('invalid password');
    }

    const token = JWT.sign(
      {
        id: artist.id,
        name: artist.name,
        entityType: EntityType.Artist,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME }
    );

    return res.status(200).json({ artist, token });
  } catch (e) {
    return res.status(500).json({ e: 'failed to sign in' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    // Find artist
    const old = await prisma.artist.findFirst({
      where: { id: req.artist.id },
    });

    if (!old) {
      return res.status(404).json({ e: 'Artist not found' });
    }

    const updateImagePath = imagePath || old.image;

    // Update artist
    const artist = await prisma.artist.update({
      where: {
        id: req.artist.id,
      },
      data: {
        name: req.body.name,
        image: updateImagePath,
      },
    });

    await client.update({
      index: 'artists',
      id: artist.id.toString(),
      body: {
        doc: { name: artist.name, image: artist.image },
      },
    });

    // Update artist data in albums
    const updateAlbums = async (artistId: number, artistName: string) => {
      const albums = await prisma.album.findMany({
        where: { artist_id: artistId },
      });

      if (albums.length === 0) {
        return;
      }

      const albumUpdates = albums.flatMap((album) => [
        { update: { _index: 'albums', _id: album.id.toString() } },
        { doc: { artist: { id: artistId, name: artistName } } },
      ]);
      console.log('album update', JSON.stringify(albumUpdates, null, 2));

      const response = await client.bulk({ body: albumUpdates });
      console.log(
        'Album bulk update response:',
        JSON.stringify(response, null, 2)
      );
    };

    // Update artist data in songs
    const updateSongs = async (artistId: number, artistName: string) => {
      const songs = await prisma.song.findMany({
        where: { song_artist: { some: { artist_id: artistId } } },
        include: { song_artist: { include: { artist: true } } },
      });

      if (songs.length === 0) {
        return;
      }

      const songUpdates = songs.flatMap((song) => [
        { update: { _index: 'songs', _id: song.id.toString() } },
        {
          doc: {
            artist: song.song_artist.map((sa) =>
              sa.artist_id === artistId
                ? { id: sa.artist.id, name: artistName }
                : { id: sa.artist.id, name: sa.artist.name }
            ),
          },
        },
      ]);
      console.log('Song updates:', JSON.stringify(songUpdates, null, 2));
      const response = await client.bulk({ body: songUpdates });
      console.log(
        'Song bulk update response:',
        JSON.stringify(response, null, 2)
      );
    };

    if (old.name !== artist.name) {
      await updateAlbums(artist.id, artist.name);
      await updateSongs(artist.id, artist.name);
    }

    // If there is new imagepath then delete the old if it exist
    removeOldFile(imagePath, old.image);

    return res.status(200).json(artist);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ e: 'failed to update' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find artist
    const artist = await prisma.artist.findUnique({
      where: { email },
    });

    if (!artist) {
      return res.status(400).json({ e: 'Email not found' });
    }

    const passwordResetToken = generateToken();

    // Update the artist token
    await prisma.artist.update({
      where: { id: artist.id },
      data: {
        passwordResetToken,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, passwordResetToken, EntityType.Artist);

    res.status(200).json('Password reset email sent');
  } catch (e) {
    res.status(500).json({ e: 'Failed to send password reset email' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    // Validation
    const result = await passwordResetSchema.validateAsync(req.body);

    // Find the artist
    const artist = await prisma.artist.findUnique({
      where: {
        passwordResetToken: token as string,
      },
    });

    if (!artist) {
      return res.status(400).json({ e: 'Invalid or expired token' });
    }

    // Update the artist password
    await prisma.artist.update({
      where: { id: artist.id },
      data: {
        password: await bcrypt.hash(result.password, 10),
        passwordResetToken: null,
      },
    });

    res.status(200).json('Password reset successfully');
  } catch (e) {
    res.status(500).json({ e: 'Failed to reset password' });
  }
};
