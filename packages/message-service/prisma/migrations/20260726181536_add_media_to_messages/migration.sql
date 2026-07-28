-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'AUDIO');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT';
