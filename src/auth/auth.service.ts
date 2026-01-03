import { MailerService } from '@nestjs-modules/mailer';

import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { Request } from 'express';
import * as ms from 'ms';

import { env } from '@/env/env.module';
import { HashService } from '@/hash/hash.service';
import { CreateUserDto } from '@/user/dto';
import { PublicUser } from '@/user/types';
import { UserService } from '@/user/user.service';

export interface EmailVerificationPayload {
	id: PublicUser['id'];
	email: PublicUser['email'];
}

@Injectable()
export class AuthService {
	constructor(
		private readonly mailer: MailerService,
		private readonly userService: UserService,
		private readonly hashService: HashService,
		private readonly jwtService: JwtService,
	) {}

	async validateUser(
		username: string,
		password: string,
	): Promise<PublicUser | null> {
		const user = await this.userService.findFirstWithPasswordWhere({
			OR: [{ username: username }, { email: username }],
		});

		if (user === null) {
			return null;
		}

		const passwordMatch = await this.hashService.compare(
			user.password,
			password,
		);

		if (!passwordMatch) {
			return null;
		}

		// eslint-disable-next-line
		const { password: _, ...userWithoutPassword } = user;

		return userWithoutPassword;
	}

	async register(user: CreateUserDto): Promise<PublicUser> {
		const existingUser = await this.userService.findOneWhere({
			email: user.email,
		});
		if (existingUser) {
			throw new ConflictException('User with same email already exists');
		}
		return this.userService.create(user);
	}

	signIn(req: Request) {
		if (!req.user) return;

		return new Promise((resolve, reject) => {
			req.login(req.user!, (err) => {
				if (err) {
					console.error('Error while logging in: ', err);
					reject(err as Error);
				} else {
					// console.log('Sign in successful, session saved');
					resolve(req.user);
				}
			});
		});
	}

	signOut(req: Request) {
		return new Promise((resolve, reject) => {
			req.logout({ keepSessionInfo: false }, (err) => {
				if (err) {
					console.error('Error while logging out: ', err);
					reject(err as Error);
				} else {
					// console.log('Sign out successful, session deleted');
					resolve({ message: 'Sign out successful' });
				}
			});
		});
	}

	async sendEmailVerificationLink(payload: EmailVerificationPayload) {
		const jwtToken = await this.generateEmailVerificationToken(payload);

		console.log(`/email-verification?t=${jwtToken}`);
		await this.mailer.sendMail({
			to: payload.email,
			subject: 'Email Verification for PMS API',
			html: `Hi! <br/>Click the following link to verify your email address: <br/> <a href='/email/verify?t=${jwtToken}'>Click to verify your email</a> <br/>Link valid for ${ms(ms(env.EMAIL_VERIFICATION_TOKEN_TTL), { long: true })}`,
		});
	}

	generateEmailVerificationToken(payload: any) {
		return this.jwtService.signAsync(payload, {
			secret: env.EMAIL_VERIFICATION_TOKEN_SECRET,
			expiresIn: env.EMAIL_VERIFICATION_TOKEN_TTL,
		});
	}
}
