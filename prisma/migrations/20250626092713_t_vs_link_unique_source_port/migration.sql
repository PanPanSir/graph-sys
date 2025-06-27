/*
  Warnings:

  - A unique constraint covering the columns `[start_port_id]` on the table `t_vs_link` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `t_vs_link_start_node_id_key` ON `t_vs_link`;

-- CreateIndex
CREATE UNIQUE INDEX `t_vs_link_start_port_id_key` ON `t_vs_link`(`start_port_id`);
