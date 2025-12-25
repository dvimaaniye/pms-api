import { User } from '@prisma/client';

export type PublicUser = Omit<User, 'password'>;

export type SessionUser = Pick<
	User,
	'id' | 'username' | 'email' | 'isEmailVerified'
>;
