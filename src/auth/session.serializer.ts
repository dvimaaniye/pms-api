import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import type { DoneCallback } from 'passport';

import { PublicUser } from '@/user/types';
import { UserService } from '@/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly userService: UserService) {
		super();
	}

	// sets user.id in the session
	serializeUser(user: PublicUser, done: Function) {
		done(null, user.id);
	}

	// takes user.id from the session and fetches user from db
	async deserializeUser(id: PublicUser['id'], done: DoneCallback) {
		const user = await this.userService.findOne(id);
		if (!user) {
			done(new NotFoundException('User not found'), null);
			return;
		}
		done(null, user);
	}
}
