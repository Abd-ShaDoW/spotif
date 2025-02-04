import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import prisma from '../config/prismaClient';
import {
  sendEmailConfirmation,
  sendPasswordResetEmail,
} from '../util/emailUtil';
import { generateToken } from '../helpers/token';
import { authSchema, passwordResetSchema } from '../helpers/validate';
import { EntityType } from '../entity/userTypes';
import { removeOldFile } from '../util/fileUtil';

// Todo: istead if returning errors return status code with informative massege

export const signUp = async (req: Request, res: Response) => {
  try {
    const imagePath = req.file ? req.file.path : null;

    // Validation
    const result = await authSchema.validateAsync(req.body);

    // Check if email is used
    const used = await prisma.user.findFirst({
      where: { email: result.email },
    });

    if (used) {
      return res.status(409).json({ e: 'email already used' });
    }

    const emailConfirmationToken = generateToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: result.email,
        userName: result.name,
        password: await bcrypt.hash(result.password, 10),
        emailConfirmationToken,
        image: imagePath,
      },
    });

    // Send email to the user to confirm
    await sendEmailConfirmation(
      result.email,
      emailConfirmationToken,
      EntityType.User
    );

    return res.status(201).json(user);
  } catch (e) {
    return res.status(400).json({ e: 'Failed to signup' });
  }
};

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    // Find the user using the token
    const user = await prisma.user.findUnique({
      where: { emailConfirmationToken: token as string },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update the user to make his email verified
    await prisma.user.update({
      where: { id: user.id },
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

    // Find user
    const user = await prisma.user.findFirst({
      where: { email: req.body.email },
    });

    if (!user) {
      return new Error('invalid credentials');
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return new Error('invalid password');
    }

    // Token assign
    const token = JWT.sign(
      {
        id: user.id,
        name: user.userName,
        entityType: EntityType.User,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME }
    );

    return res.status(200).json({ user, token });
  } catch (e) {
    return res.status(500).json({ e: 'failed to sign in' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const imagepath = req.file ? req.file.path : null;

    // Check if user exist
    const old = await prisma.user.findFirst({ where: { id: req.user.id } });

    if (!old) {
      return res.status(404).json({ e: 'User not found' });
    }

    // Update user
    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        userName: req.body.userName,
        image: imagepath,
      },
    });

    // If there is new imagepath then delete the old if it exist
    removeOldFile(imagepath, old.image);

    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({ e: 'failed to update' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ e: 'Email not found' });
    }

    const passwordResetToken = generateToken();

    // Update the user token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, passwordResetToken, EntityType.User);

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

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        passwordResetToken: token as string,
      },
    });

    if (!user) {
      return res.status(400).json({ e: 'Invalid or expired token' });
    }

    // Update the user password
    await prisma.user.update({
      where: { id: user.id },
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
