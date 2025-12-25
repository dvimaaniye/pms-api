import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { RedisStore } from 'connect-redis';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import * as session from 'express-session';
import { SessionOptions } from 'express-session';
import * as ms from 'ms';

import { REDIS_SESSION_STORE } from '@/common/redis/redis.config';
import { config } from '@/config/config.module';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
	private expressSessionMiddleware: RequestHandler;

	private options: SessionOptions = {
		name: 'sid',
		secret: config.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: config.NODE_ENV === 'production',
			httpOnly: true,
			sameSite: true,
			maxAge: ms(config.SESSION_TTL),
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
