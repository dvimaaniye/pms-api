import { Transform, Type } from 'class-transformer';
import { IsAlpha, IsEmail, IsOptional, MinLength } from 'class-validator';

import { toLowerCase } from '@/common/transformers';

export class PatchUserDto {
	@Type(() => String)
	@Transform(toLowerCase)
	@IsEmail()
	@IsOptional()
	email?: string;

	@Type(() => String)
	@Transform(toLowerCase)
	@MinLength(1)
	@IsAlpha()
	@IsOptional()
	firstName?: string;

	@Type(() => String)
	@Transform(toLowerCase)
	@MinLength(1)
	@IsAlpha()
	@IsOptional()
	lastName?: string;
}
