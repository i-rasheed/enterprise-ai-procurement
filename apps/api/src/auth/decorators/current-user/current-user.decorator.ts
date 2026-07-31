import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequest } from '../../../common/types/authenticated-request.interface';
import { JwtPayload } from '../../../common/types/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
