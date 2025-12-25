-- DropForeignKey
ALTER TABLE `organization_invitation` DROP FOREIGN KEY `organization_invitation_email_fkey`;

-- AlterTable
ALTER TABLE `organization_invitation` ADD COLUMN `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `organization_invitation` ADD CONSTRAINT `organization_invitation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
