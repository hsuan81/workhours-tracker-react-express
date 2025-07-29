/*
  Warnings:

  - Made the column `monthlySalary` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hourlyRate` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "monthlySalary" SET NOT NULL,
ALTER COLUMN "hourlyRate" SET NOT NULL;
