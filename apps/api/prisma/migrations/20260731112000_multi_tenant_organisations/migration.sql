-- Add slug column (nullable initially for backfill)
ALTER TABLE "public"."Organisation" ADD COLUMN "slug" TEXT;

-- Backfill slug from organisation name
UPDATE "public"."Organisation"
SET "slug" = LOWER(REGEXP_REPLACE(TRIM("name"), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Ensure empty slugs get an id-based fallback
UPDATE "public"."Organisation"
SET "slug" = CONCAT('org-', "id")
WHERE "slug" IS NULL OR "slug" = '';

-- Assign orphaned users to their first organisation (or create a default tenant)
INSERT INTO "public"."Organisation" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT 'legacy-default-org', 'Legacy Organisation', 'legacy-organisation', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."Organisation" WHERE "slug" = 'legacy-organisation'
);

UPDATE "public"."User"
SET "organisationId" = (
  SELECT "id" FROM "public"."Organisation" ORDER BY "createdAt" ASC LIMIT 1
)
WHERE "organisationId" IS NULL;

-- Make slug required and unique
ALTER TABLE "public"."Organisation" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Organisation_slug_key" ON "public"."Organisation"("slug");

-- Drop global email unique constraint
DROP INDEX IF EXISTS "User_email_key";

-- Make organisationId required
ALTER TABLE "public"."User" ALTER COLUMN "organisationId" SET NOT NULL;

-- Add composite unique constraint for tenant-scoped emails
CREATE UNIQUE INDEX "User_organisationId_email_key" ON "public"."User"("organisationId", "email");

-- Update foreign key to cascade on organisation delete
ALTER TABLE "public"."User" DROP CONSTRAINT IF EXISTS "User_organisationId_fkey";
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organisationId_fkey"
  FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
