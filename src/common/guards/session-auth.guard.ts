import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';

import type { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext) {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest<Request>();

		if (!request.user?.id) {
			throw new UnauthorizedException(
				'You must be logged in to access this resource',
			);
		}

		return true;
	}
}
