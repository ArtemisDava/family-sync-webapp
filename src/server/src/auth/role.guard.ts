import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    console.log('User ID from request:', userId);

    if (!userId) throw new ForbiddenException('User not authenticated');

    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new ForbiddenException('User not found');

    if (requiredRoles?.length > 0 && !user.isAdmin) {
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) throw new ForbiddenException('Insufficient permissions');
    }

    request.userRole = user.role;

    return true;
  }
}
