import { User } from './auth.entity';

export interface IAuthRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(user: Partial<User>): Promise<User>;
    countUsers(): Promise<number>;
    update(id: string, data: Partial<User>): Promise<User>;
}
