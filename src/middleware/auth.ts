import JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { EntityType } from '../entity/userTypes';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; userName: string };
      artist?: { id: number; name: string };
    }
  }
}

interface MyJwtPayload {
  id: number;
  name: string;
  entityType: EntityType; // Entity type: 'user' or 'artist'
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    throw Error('No token provided');
  }

  const token = auth.split(' ')[1];
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET) as MyJwtPayload;
    const { id, name, entityType } = decoded;

    // Determine the appropriate property (user or artist) to attach to the request object
    if (entityType === EntityType.User) {
      req.user = { id, userName: name };
    } else if (entityType === EntityType.Artist) {
      req.artist = { id, name };
    } else {
      throw new Error('Invalid entity type');
    }

    next();
  } catch (e) {
    console.error('JWT verification error:', e);
    throw Error('Invalid token');
  }
};
