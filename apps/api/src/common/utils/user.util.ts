import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  return safeUser;
}
