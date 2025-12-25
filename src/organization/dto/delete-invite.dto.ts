import { Transform, Type } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

import { toLowerCase } from '@/common/transformers';

export class DeleteInviteDto {
	@Type(() => String)
	@Transform(toLowerCase)
	@IsEmail()
	@MaxLength(254)
	email!: string;
}
