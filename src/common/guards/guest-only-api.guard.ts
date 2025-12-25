import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from '@nestjs/common';

import type { Request } from 'express';

@Injectable()
export class GuestOnlyApiGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest<Request>();

		if (request.user?.id) {
			throw new BadRequestException({
				message: 'You are already logged in',
				user: request.user,
				redirectTo: '/dashboard',
			});
		}

		return true;
	}
}
