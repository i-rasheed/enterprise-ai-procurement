-- Drop tenant-scoped email uniqueness
DROP INDEX IF EXISTS "User_organisationId_email_key";

-- Remove organisation slug
DROP INDEX IF EXISTS "Organisation_slug_key";
ALTER TABLE "public"."Organisation" DROP COLUMN IF EXISTS "slug";

-- Allow users without an organisation
ALTER TABLE "public"."User" ALTER COLUMN "organisationId" DROP NOT NULL;

-- Drop existing FK so we can recreate with SET NULL on delete
ALTER TABLE "public"."User" DROP CONSTRAINT IF EXISTS "User_organisationId_fkey";
ALTER TABLE "public"."User"
  ADD CONSTRAINT "User_organisationId_fkey"
  FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Deduplicate emails before global uniqueness (keep oldest account per email)
DELETE FROM "public"."User" a
USING "public"."User" b
WHERE a.email = b.email
  AND a."createdAt" > b."createdAt";

DELETE FROM "public"."User" a
USING "public"."User" b
WHERE a.email = b.email
  AND a."createdAt" = b."createdAt"
  AND a.id > b.id;

-- Globally unique email
DROP INDEX IF EXISTS "User_email_key";
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
