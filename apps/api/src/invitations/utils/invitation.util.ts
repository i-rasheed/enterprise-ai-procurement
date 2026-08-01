import { Invitation } from '@prisma/client';

export type SafeInvitation = Omit<Invitation, 'token'>;

export function toSafeInvitation(invitation: Invitation): SafeInvitation {
  const { token, ...safeInvitation } = invitation;
  void token;
  return safeInvitation;
}
