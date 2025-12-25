import 'express-session';

import type { PublicUser } from '@/user/types';

declare module 'express-session' {
	interface SessionData {
		passport?: {
			user: PublicUser;
		};
	}
}
