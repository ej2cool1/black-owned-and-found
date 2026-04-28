/*
  Warnings:

  - You are about to drop the column `adress` on the `Business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "adress",
ADD COLUMN     "address" TEXT,
ALTER COLUMN "city" DROP NOT NULL;
