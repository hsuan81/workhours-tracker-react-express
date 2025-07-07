/*
  Warnings:

  - You are about to drop the column `endTime` on the `TimeEntry` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TimeEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "endTime",
DROP COLUMN "startTime";
