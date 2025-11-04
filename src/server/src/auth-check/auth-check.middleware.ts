import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';

export const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload & {
    userId: string;
  };
  userRole?: string;
}

@Injectable()
export class AuthCheckMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: () => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verify(token, JWT_SECRET) as JwtPayload & {
        userId: string;
      };

      req.user = decoded;

      next();
    } catch (error) {
      throw new ForbiddenException('Invalid or expired authentication token.');
    }
  }
}
