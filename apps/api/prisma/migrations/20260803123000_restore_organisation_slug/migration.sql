-- Restore organisation slug removed by simplify_organisation_relationships
ALTER TABLE "public"."Organisation" ADD COLUMN IF NOT EXISTS "slug" TEXT;

UPDATE "public"."Organisation"
SET "slug" = LOWER(REGEXP_REPLACE(TRIM("name"), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

UPDATE "public"."Organisation"
SET "slug" = CONCAT('org-', "id")
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "public"."Organisation" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Organisation_slug_key" ON "public"."Organisation"("slug");
