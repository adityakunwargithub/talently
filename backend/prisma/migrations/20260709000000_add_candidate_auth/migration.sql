-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN "username" TEXT;
ALTER TABLE "Candidate" ADD COLUMN "passwordHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_username_key" ON "Candidate"("username");
