-- CreateTable
CREATE TABLE `t_vs_project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `description` VARCHAR(255) NULL,
    `context_path` VARCHAR(600) NULL,
    `compile_version` INTEGER NOT NULL DEFAULT 0,
    `method` VARCHAR(8) NULL,
    `properties` JSON NULL,
    `state` VARCHAR(12) NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modify_time` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_vs_project_name_key`(`name`),
    UNIQUE INDEX `t_vs_project_context_path_key`(`context_path`),
    INDEX `context_id_version`(`context_path`, `id`, `compile_version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_vs_port` (
    `id` VARCHAR(64) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `node_id` VARCHAR(64) NOT NULL,
    `type` VARCHAR(16) NOT NULL,
    `properties` JSON NOT NULL,
    `context_comp_api_id` INTEGER NULL,
    `http_comp_api_id` INTEGER NULL,
    `source_api_type` VARCHAR(12) NULL,
    `target_api_type` VARCHAR(12) NULL,
    `source_api_id` INTEGER NULL,
    `target_api_id` INTEGER NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modify_time` DATETIME(3) NOT NULL,

    INDEX `t_vs_port_project_id_idx`(`project_id`),
    INDEX `t_vs_port_node_id_idx`(`node_id`),
    INDEX `t_vs_port_source_api_id_idx`(`source_api_id`),
    INDEX `t_vs_port_target_api_id_idx`(`target_api_id`),
    INDEX `target_api_type_api_id`(`target_api_type`, `target_api_id`),
    INDEX `source_api_type_api_id`(`source_api_type`, `source_api_id`),
    INDEX `context_api_id`(`context_comp_api_id`),
    INDEX `http_api_id`(`http_comp_api_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_vs_node` (
    `id` VARCHAR(64) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `task_type` VARCHAR(16) NOT NULL,
    `script` LONGTEXT NOT NULL,
    `class_bytes` LONGBLOB NOT NULL,
    `properties` JSON NOT NULL,
    `view_type` VARCHAR(16) NOT NULL,
    `up_level_node_id` VARCHAR(64) NOT NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modify_time` DATETIME(3) NOT NULL,

    INDEX `t_vs_node_project_id_idx`(`project_id`),
    INDEX `t_vs_node_up_level_node_id_idx`(`up_level_node_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_vs_link` (
    `id` VARCHAR(64) NOT NULL,
    `project_id` INTEGER NOT NULL,
    `start_node_id` VARCHAR(64) NOT NULL,
    `end_node_id` VARCHAR(64) NOT NULL,
    `start_port_id` VARCHAR(64) NOT NULL,
    `end_port_id` VARCHAR(64) NOT NULL,
    `properties` JSON NOT NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modify_time` DATETIME(3) NOT NULL,

    INDEX `t_vs_link_project_id_idx`(`project_id`),
    INDEX `t_vs_link_end_node_id_idx`(`end_node_id`),
    UNIQUE INDEX `t_vs_link_start_port_id_end_port_id_key`(`start_port_id`, `end_port_id`),
    UNIQUE INDEX `t_vs_link_start_node_id_key`(`start_node_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
