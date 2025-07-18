/*
  Warnings:

  - You are about to drop the column `hoursWorked` on the `TimeEntry` table. All the data in the column will be lost.
  - Added the required column `hours` to the `TimeEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimeEntry" DROP COLUMN "hoursWorked",
ADD COLUMN     "hours" DECIMAL(4,2) NOT NULL;
