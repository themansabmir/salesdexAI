import jwt from 'jsonwebtoken';
import { ITokenService } from '@/core/ports/token.port';
import { config } from '@/config';

export class JwtTokenService implements ITokenService {
  sign(payload: any): string {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET as string, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN as any
    });
  }

  verify<T>(token: string): T {
    return jwt.verify(token, config.JWT_ACCESS_SECRET as string) as T;
  }
}
