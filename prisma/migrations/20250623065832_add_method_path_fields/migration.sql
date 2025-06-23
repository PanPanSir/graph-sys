/*
  Warnings:

  - You are about to drop the column `context_comp_api_id` on the `t_vs_port` table. All the data in the column will be lost.
  - You are about to drop the column `http_comp_api_id` on the `t_vs_port` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `context_api_id` ON `t_vs_port`;

-- DropIndex
DROP INDEX `http_api_id` ON `t_vs_port`;

-- AlterTable
ALTER TABLE `t_vs_port` DROP COLUMN `context_comp_api_id`,
    DROP COLUMN `http_comp_api_id`,
    ADD COLUMN `method` VARCHAR(8) NULL,
    ADD COLUMN `path` VARCHAR(128) NULL;
