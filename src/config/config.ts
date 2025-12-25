import { Injectable } from '@nestjs/common';

import { IsString } from 'class-validator';
import { StringValue } from 'ms';

@Injectable()
export class Config {
	@IsString()
	public readonly NODE_ENV!: string;

	@IsString()
	public readonly REDIS_URL!: string;

	@IsString()
	public readonly APP_DATABASE_URL!: string;

	@IsString()
	public readonly SESSION_TTL!: StringValue;

	@IsString()
	public readonly SESSION_SECRET!: string;

	@IsString()
	public readonly EMAIL_VERIFICATION_TOKEN_TTL!: StringValue;

	@IsString()
	public readonly EMAIL_VERIFICATION_TOKEN_SECRET!: string;
}
