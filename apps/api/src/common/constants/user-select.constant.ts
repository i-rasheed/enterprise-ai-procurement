import { Prisma } from '@prisma/client';

export const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isVerified: true,
  organisationId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUserRecord = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;
