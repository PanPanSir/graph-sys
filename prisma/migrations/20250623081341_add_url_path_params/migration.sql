-- AlterTable
ALTER TABLE `t_vs_port` ADD COLUMN `pathParams` JSON NULL,
    ADD COLUMN `url` VARCHAR(255) NULL;
