import type { PublicUser } from '../types';

export const USER_CREATED_EVENT = 'user.created';

export class UserCreatedEvent {
	constructor(public readonly user: PublicUser) {}
}
