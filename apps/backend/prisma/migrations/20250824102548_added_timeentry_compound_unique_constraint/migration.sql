/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,projectId]` on the table `TimeEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TimeEntry_userId_date_projectId_key" ON "TimeEntry"("userId", "date", "projectId");
