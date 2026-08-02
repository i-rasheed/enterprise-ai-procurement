import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { JwtPayload } from '../../common/types/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.usersService.findById(userId);

    if (!user?.isPlatformAdmin) {
      throw new ForbiddenException('Platform admin access required');
    }

    return true;
  }
}
