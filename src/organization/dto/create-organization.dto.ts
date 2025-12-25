import { Type } from 'class-transformer';
import { IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
	@Type(() => String)
	@MinLength(1)
	@MaxLength(255)
	name!: string;

	@Type(() => String)
	@MaxLength(1000)
	@IsOptional()
	description?: string;
}
