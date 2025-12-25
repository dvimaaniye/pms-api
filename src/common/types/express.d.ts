import type { PublicUser } from '@/user/types';

// declare module 'express-serve-static-core' {
// 	interface User extends PublicUser {}
// 	interface Request {
// 		user?: PublicUser;
// 	}
// }

declare global {
	namespace Express {
		interface User extends PublicUser {}

		interface Request {
			user?: User;
		}
	}
}
