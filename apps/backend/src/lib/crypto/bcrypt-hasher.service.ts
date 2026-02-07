import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../core/ports/password-hasher.port';

export class BcryptHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
