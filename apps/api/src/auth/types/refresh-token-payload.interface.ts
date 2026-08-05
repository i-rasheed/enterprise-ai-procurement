import { JwtPayload } from '../../common/types/jwt-payload.interface';

export interface RefreshTokenPayload extends JwtPayload {
  jti: string;
  familyId: string;
}
