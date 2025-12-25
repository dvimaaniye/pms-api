-- DropForeignKey
ALTER TABLE `organization_member` DROP FOREIGN KEY `organization_member_userId_fkey`;

-- DropForeignKey
ALTER TABLE `project_member` DROP FOREIGN KEY `project_member_addedById_fkey`;

-- DropForeignKey
ALTER TABLE `project_member` DROP FOREIGN KEY `project_member_userId_fkey`;

-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `task_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `task_comment` DROP FOREIGN KEY `task_comment_authorId_fkey`;

-- DropIndex
DROP INDEX `project_member_addedById_fkey` ON `project_member`;

-- DropIndex
DROP INDEX `task_createdById_fkey` ON `task`;

-- DropIndex
DROP INDEX `task_comment_authorId_fkey` ON `task_comment`;

-- AlterTable
ALTER TABLE `project_member` MODIFY `addedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `task` MODIFY `createdById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_comment` ADD CONSTRAINT `task_comment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_member` ADD CONSTRAINT `organization_member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member` ADD CONSTRAINT `project_member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member` ADD CONSTRAINT `project_member_addedById_fkey` FOREIGN KEY (`addedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
