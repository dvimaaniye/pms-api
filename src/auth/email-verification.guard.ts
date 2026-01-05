import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { Request } from 'express';
import { RedisClientType } from 'redis';

import { REDIS_EMAIL_TOKEN_CLIENT } from '@/common/redis/redis.config';
import { env } from '@/env/env.module';

import { EmailVerificationPayload } from './auth.service';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
	protected unauthorizedMessage = 'Invalid or expired email verification token';

	constructor(
		private readonly jwtService: JwtService,
		@Inject(REDIS_EMAIL_TOKEN_CLIENT)
		private readonly emailTokenRedisService: RedisClientType,
	) {}

	async canActivate(context: ExecutionContext) {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest<Request>();
		const token = request.query.t as string;

		if (!token) {
			throw new BadRequestException('Email verification token is required');
		}

		let payload: EmailVerificationPayload;
		try {
			payload = await this.jwtService.verifyAsync<EmailVerificationPayload>(
				token,
				{
					secret: env.EMAIL_VERIFICATION_TOKEN_SECRET,
				},
			);
		} catch {
			throw new UnauthorizedException(this.unauthorizedMessage);
		}

		const storedToken = await this.emailTokenRedisService.get(payload.email);

		if (!storedToken || storedToken !== token) {
			throw new UnauthorizedException(this.unauthorizedMessage);
		}

		request['emailVerification'] = payload;

		return true;
	}
}
