-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "organisationId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
