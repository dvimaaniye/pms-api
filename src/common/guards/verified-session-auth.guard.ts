import {
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';

import type { Request } from 'express';

import { SessionAuthGuard } from './session-auth.guard';

@Injectable()
export class VerifiedSessionAuthGuard extends SessionAuthGuard {
	canActivate(context: ExecutionContext) {
		const hasValidSession = super.canActivate(context);
		if (!hasValidSession) return false;

		const request = context.switchToHttp().getRequest<Request>();
		const user = request.user;

		if (!user?.isEmailVerified) {
			throw new ForbiddenException('Email verification required');
		}

		return true;
	}
}
