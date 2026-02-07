import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../ports/token.port';

export const createAuthMiddleware = (tokenService: ITokenService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = tokenService.verify(token);
      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};
