// auth-check.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express'; // Importera express-typerna
import { verify, JwtPayload } from 'jsonwebtoken';

export const JWT_SECRET = 'YOUR_SUPER_SECRET_KEY'; // Hämta från ConfigService i prod

// Utöka Request-interfacet för att inkludera 'user'
export interface AuthenticatedRequest extends Request {
  user: JwtPayload & {
    userId: string;
  };
}

@Injectable()
export class AuthCheckMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: () => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Ingen token. Behandla som gäst.
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verify(token, JWT_SECRET) as JwtPayload & {
        userId: string;
      };

      // Lägg till avkodad payload till request-objektet
      req.user = decoded;

      next();
    } catch (error) {
      // Ogiltig token (utgången, fel signatur, etc.)
      // Vi kastar ett undantag som Nest hanterar och returnerar 403 Forbidden.
      throw new ForbiddenException('Invalid or expired authentication token.');
    }
  }
}
