/*
  Warnings:

  - You are about to drop the `OvertimeRate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OvertimeRate";

-- CreateTable
CREATE TABLE "DailyOvertime" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "overtimeHours" DECIMAL(4,2) NOT NULL,
    "overtimePay" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyOvertime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyOvertime_userId_date_idx" ON "DailyOvertime"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyOvertime_userId_date_key" ON "DailyOvertime"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyOvertime" ADD CONSTRAINT "DailyOvertime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
