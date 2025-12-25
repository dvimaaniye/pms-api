import {
	Body,
	Controller,
	Delete,
	Get,
	Patch,
	Req,
	UseGuards,
} from '@nestjs/common';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';

import { Prisma } from '@prisma/client';
import { Request } from 'express';

import { SessionAuthGuard } from '@/common/guards/session-auth.guard';
import { VerifiedSessionAuthGuard } from '@/common/guards/verified-session-auth.guard';

import {
	USER_DELETED_EVENT,
	UserDeletedEvent,
} from './event/user-deleted.event';
import { PatchUserDto } from './types';
import { PatchUserDto } from './dto';
import { PublicUser } from './types';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(SessionAuthGuard)
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly eventEmitter: EventEmitter,
	) {}

	@Get('/profile')
	getProfile(@Req() req: Request) {
		return this.userService.findOne(req.user!.id);
	}

	@Patch('/profile')
	async patchUpdateProfile(@Req() req: Request, @Body() body: PatchUserDto) {
		const patch: Prisma.UserUpdateInput = { ...body };

		if (body.email !== req.user!.email) {
			patch.isEmailVerified = false;
		}

		const updatedUser = await this.userService.update(req.user!.id, patch);

		// Update the session data only if email was changed
		if (updatedUser.email !== req.user!.email) {
			req.user!.email = updatedUser.email;
			req.user!.isEmailVerified = updatedUser.isEmailVerified;

			// 	await new Promise((resolve, reject) => {
			// 		req.session.save((err) =>
			// 			err ? reject(err as Error) : resolve(undefined),
			// 		);
			// 	});
		}

		return updatedUser;
	}

	@Delete('/profile')
	async deleteProfile(@Req() req: Request) {
		await this.userService.delete(req.user!.id);

		this.eventEmitter.emit(USER_DELETED_EVENT, new UserDeletedEvent(req));

		return { message: 'User deleted successfully' };
	}

	@Get('/check-email-verification')
	@UseGuards(VerifiedSessionAuthGuard)
	checkEmailVerification() {
		return { message: 'Your email is verified' };
	}
}
