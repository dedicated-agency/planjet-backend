/*
  Warnings:

  - Added the required column `id` to the `TaskComment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `TaskComment_task_id_user_id_key` ON `TaskComment`;

-- AlterTable
ALTER TABLE `TaskComment` ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
