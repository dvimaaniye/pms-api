import { Transform, Type } from 'class-transformer';
import {
	IsAlpha,
	IsAlphanumeric,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

import { toLowerCase } from '@/common/transformers';
import {
	HasLowercase,
	HasNumber,
	HasSymbol,
	HasUppercase,
} from '@/common/validators';

export class CreateUserDto {
	@Type(() => String)
	@Transform(toLowerCase)
	@IsEmail()
	@MaxLength(254)
	email!: string;

	@Type(() => String)
	@Transform(toLowerCase)
	@Matches(/^[A-Za-z0-9_]+$/, {
		message: 'Username can contain only letters, numbers, and underscores',
	})
	@MinLength(3)
	@MaxLength(64)
	username!: string;

	@Type(() => String)
	@IsNotEmpty()
	@MinLength(8, { message: '$property should be at least 8 characters long.' })
	@HasLowercase()
	@HasUppercase()
	@HasNumber()
	@HasSymbol()
	password!: string;

	@Type(() => String)
	@MinLength(1)
	@MaxLength(255)
	@IsAlpha()
	firstName!: string;

	@Type(() => String)
	@MaxLength(255)
	@IsAlpha()
	@IsOptional()
	lastName?: string;
}
