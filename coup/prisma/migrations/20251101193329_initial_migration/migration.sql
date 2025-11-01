-- CreateEnum
CREATE TYPE "StudyMemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'LEFT');

-- CreateEnum
CREATE TYPE "StudyVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "StudyGroup" ADD COLUMN     "visibility" "StudyVisibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "StudyMember" ADD COLUMN     "joinMessage" TEXT,
ADD COLUMN     "status" "StudyMemberStatus" NOT NULL DEFAULT 'PENDING';
