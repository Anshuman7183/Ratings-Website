/*
  Warnings:

  - You are about to alter the column `value` on the `Rating` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "value" SET DATA TYPE SMALLINT;

-- CreateIndex
CREATE INDEX "Store_name_idx" ON "Store"("name");

-- CreateIndex
CREATE INDEX "Store_address_idx" ON "Store"("address");
