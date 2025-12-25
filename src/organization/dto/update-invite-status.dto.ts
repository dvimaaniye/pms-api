import { InvitationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';

export class UpdateInviteStatusDto {
	@Type(() => String)
	@IsEnum(InvitationStatus)
	status!: InvitationStatus;
}
