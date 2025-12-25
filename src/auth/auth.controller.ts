import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Get,
	InternalServerErrorException,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';

import type { Request } from 'express';

import { GuestOnlyApiGuard } from '@/common/guards/guest-only-api.guard';
import { SessionAuthGuard } from '@/common/guards/session-auth.guard';
import { CreateUserDto } from '@/user/dto';
import {
	USER_CREATED_EVENT,
	UserCreatedEvent,
} from '@/user/event/user-created.event';
import { UserService } from '@/user/user.service';

import { AuthService, EmailVerificationPayload } from './auth.service';
import { EmailVerificationGuard } from './email-verification.guard';
import { LocalAuthGuard } from './strategy/local-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly eventEmitter: EventEmitter,
	) {}

	@Post('/register')
	@UseGuards(GuestOnlyApiGuard)
	async register(@Body() createUserDto: CreateUserDto) {
		const newUser = await this.authService.register(createUserDto);

		this.eventEmitter.emit(USER_CREATED_EVENT, new UserCreatedEvent(newUser));

		return newUser;
	}

	@Post('/sign-in')
	@UseGuards(GuestOnlyApiGuard, LocalAuthGuard)
	signIn(@Req() req: Request) {
		if (!req.user?.id) {
			throw new InternalServerErrorException('Sign in Failed');
		}

		return this.authService.signIn(req);
	}

	@Post('/sign-out')
	@UseGuards(SessionAuthGuard)
	signOut(@Req() req: Request) {
		return this.authService.signOut(req);
	}

	@Post('/email-verification')
	@UseGuards(SessionAuthGuard)
	async sendVerificationEmail(@Req() req: Request) {
		if (req.user!.isEmailVerified) {
			throw new ConflictException('Email already verified');
		}

		const payload: EmailVerificationPayload = {
			id: req.user!.id,
			email: req.user!.email,
		};

		await this.authService.sendEmailVerificationLink(payload);

		return { message: 'Verification email sent successfully' };
	}

	@Get('/email-verification')
	@UseGuards(EmailVerificationGuard)
	async emailVerification(@Req() req: Request) {
		const payload = req['emailVerification'] as EmailVerificationPayload;

		const concernedUser = await this.userService.findOneAndSelect(payload.id, {
			id: true,
			email: true,
			isEmailVerified: true,
		});

		if (!concernedUser) {
			throw new BadRequestException('Invalid verification token');
		}

		if (concernedUser.email !== payload.email) {
			throw new BadRequestException('Token email mismatch');
		}

		if (concernedUser.isEmailVerified) {
			throw new ConflictException('Email is already verified');
		}

		await this.userService.update(concernedUser.id, { isEmailVerified: true });

		// Update session if this user is logged in
		if (req.user && req.user.id === concernedUser.id) {
			req.user.isEmailVerified = true;

			// await new Promise((resolve, reject) => {
			// 	req.session.save((err) =>
			// 		err ? reject(err as Error) : resolve(undefined),
			// 	);
			// });
		}

		return { message: 'Email verified successfully' };
	}

	@Get('/check')
	check(@Req() req: Request) {
		return {
			message: req.isAuthenticated()
				? req.user.email
				: 'You are not authenticated',
		};
	}
}
