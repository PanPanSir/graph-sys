/*
  Warnings:

  - You are about to alter the column `project_id` on the `t_vs_link` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `project_id` on the `t_vs_node` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `project_id` on the `t_vs_port` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `t_vs_link` MODIFY `project_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `t_vs_node` MODIFY `project_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `t_vs_port` MODIFY `project_id` INTEGER NOT NULL;
