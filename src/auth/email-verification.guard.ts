import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { Request } from 'express';

import { env } from '@/env/env.module';

import { EmailVerificationPayload } from './auth.service';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	async canActivate(context: ExecutionContext) {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest<Request>();
		const token = request.query.t as string;

		if (!token) {
			throw new BadRequestException('Email verification token is required');
		}

		try {
			const payload =
				await this.jwtService.verifyAsync<EmailVerificationPayload>(token, {
					secret: env.EMAIL_VERIFICATION_TOKEN_SECRET,
				});

			request['emailVerification'] = payload;

			return true;
		} catch {
			throw new UnauthorizedException(
				'Invalid or expired email verification token',
			);
		}
	}
}
