import { Injectable } from '@nestjs/common';

import { IsBoolean, IsEnum, IsPort, IsString } from 'class-validator';
import { StringValue } from 'ms';

import { IsMsStringValue } from '@/common/validators';

enum NODE_ENV {
	DEV = 'development',
	PROD = 'production',
	TEST = 'test',
	STAGING = 'staging',
}

@Injectable()
export class EnvSchema {
	@IsEnum(NODE_ENV)
	public readonly NODE_ENV!: NODE_ENV;

	@IsString()
	public readonly REDIS_URL!: string;

	@IsString()
	public readonly APP_DATABASE_URL!: string;

	@IsMsStringValue()
	public readonly SESSION_TTL!: StringValue;

	@IsString()
	public readonly SESSION_SECRET!: string;

	@IsMsStringValue()
	public readonly EMAIL_VERIFICATION_TOKEN_TTL!: StringValue;

	@IsString()
	public readonly EMAIL_VERIFICATION_TOKEN_SECRET!: string;

	@IsString()
	public readonly MAIL_HOST!: string;

	@IsPort()
	public readonly MAIL_PORT!: number;

	@IsString()
	public readonly MAIL_USER!: string;

	@IsString()
	public readonly MAIL_PASSWORD!: string;

	@IsString()
	public readonly MAIL_FROM!: string;

	@IsBoolean()
	public get isDev() {
		return this.NODE_ENV === NODE_ENV.DEV;
	}

	@IsBoolean()
	public get isProd() {
		return this.NODE_ENV === NODE_ENV.PROD;
	}

	@IsBoolean()
	public get isTest() {
		return this.NODE_ENV === NODE_ENV.TEST;
	}

	@IsBoolean()
	public get isStaging() {
		return this.NODE_ENV === NODE_ENV.STAGING;
	}
}
