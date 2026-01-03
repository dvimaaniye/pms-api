import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { RedisStore } from 'connect-redis';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import * as session from 'express-session';
import { SessionOptions } from 'express-session';
import * as ms from 'ms';

import { REDIS_SESSION_STORE } from '@/common/redis/redis.config';
import { env } from '@/env/env.module';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
	private expressSessionMiddleware: RequestHandler;

	private options: SessionOptions = {
		name: 'sid',
		secret: env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: env.isProd,
			httpOnly: true,
			sameSite: true,
			maxAge: ms(env.SESSION_TTL),
		},
	};

	constructor(@Inject(REDIS_SESSION_STORE) sessionStore: RedisStore) {
		this.options.store = sessionStore;
		this.expressSessionMiddleware = session(this.options);
	}

	use(req: Request, res: Response, next: NextFunction) {
		void this.expressSessionMiddleware(req, res, next);
	}
}
