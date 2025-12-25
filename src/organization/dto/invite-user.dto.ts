import { OrganizationRole } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsEnum, MaxLength } from 'class-validator';

import { toLowerCase } from '@/common/transformers';

export class InviteUserDto {
	@Type(() => String)
	@Transform(toLowerCase)
	@IsEmail()
	@MaxLength(254)
	email!: string;

	@Type(() => String)
	@IsEnum(OrganizationRole)
	role!: OrganizationRole;
}
