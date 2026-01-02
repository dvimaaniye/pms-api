import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	Patch,
	Req,
	UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { SessionAuthGuard } from '@/common/guards/session-auth.guard';
import { VerifiedSessionAuthGuard } from '@/common/guards/verified-session-auth.guard';

import { PatchUserDto } from './dto';
import { PublicUser } from './types';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(SessionAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('/me')
	getMe(@CurrentUser() user: PublicUser) {
		return this.userService.findOne(user.id);
	}

	@Patch('/me')
	updateMe(@CurrentUser() user: PublicUser, @Body() body: PatchUserDto) {
		return this.userService.update(user.id, body);
	}

	@Delete('/me')
	async deleteMe(@CurrentUser() user: PublicUser, @Req() req: Request) {
		await this.userService.delete(user.id);
		req.logout({}, (err) => {
			if (err) {
				throw new HttpException(
					'Error logging out after account deletion',
					500,
				);
			}
		});
		return { message: 'User deleted successfully' };
	}

	@Get('/me/email-verification-status')
	@UseGuards(VerifiedSessionAuthGuard)
	getEmailVerificationStatus() {
		return { message: 'Your email is verified' };
	}
}
