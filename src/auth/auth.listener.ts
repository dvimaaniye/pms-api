import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
	USER_CREATED_EVENT,
	UserCreatedEvent,
} from '@/user/event/user-created.event';
import {
	USER_DELETED_EVENT,
	UserDeletedEvent,
} from '@/user/event/user-deleted.event';

import { AuthService } from './auth.service';

@Injectable()
export class AuthListener {
	constructor(private readonly authService: AuthService) {}

	@OnEvent(USER_CREATED_EVENT, { async: true })
	async handleUserCreated(event: UserCreatedEvent) {
		await this.authService.sendEmailVerificationLink(event.user);
	}

	@OnEvent(USER_DELETED_EVENT, { async: true })
	async handleUserDeleted(event: UserDeletedEvent) {}
}
