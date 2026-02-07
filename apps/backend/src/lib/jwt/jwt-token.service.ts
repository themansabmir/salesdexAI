import jwt from 'jsonwebtoken';
import { ITokenService } from '../../core/ports/token.port';
import { config } from '../../config/config';

export class JwtTokenService implements ITokenService {
  sign(payload: any): string {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  }

  verify<T>(token: string): T {
    return jwt.verify(token, config.JWT_SECRET) as T;
  }
}
