/*
  Warnings:

  - You are about to alter the column `method` on the `t_vs_project` table. The data in that column could be lost. The data in that column will be cast from `VarChar(8)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `t_vs_link` MODIFY `project_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `t_vs_node` MODIFY `project_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `t_vs_project` MODIFY `method` ENUM('GET', 'POST') NULL;
