import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { UpdateRoleSchema } from './user.dto';

export class UserController {
    constructor(private readonly userService: UserService) { }

    updateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const data = UpdateRoleSchema.parse(req.body);
            const user = await this.userService.updateUserRole(id, data.platformRole, data.organizationRole);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params as { id: string };
            const user = await this.userService.getUser(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const offset = req.query.offset ? Number(req.query.offset) : 0;
            const users = await this.userService.listUsers(limit, offset);
            res.json(users);
        } catch (error) {
            next(error);
        }
    };
}
