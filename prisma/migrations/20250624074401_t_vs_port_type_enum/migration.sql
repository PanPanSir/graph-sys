/*
  Warnings:

  - You are about to alter the column `type` on the `t_vs_port` table. The data in that column could be lost. The data in that column will be cast from `VarChar(16)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `t_vs_port` MODIFY `type` ENUM('INPUT_PORT', 'OUTPUT_PORT') NOT NULL;
