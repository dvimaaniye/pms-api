import { Provider } from '@nestjs/common';

import { RedisStore } from 'connect-redis';
import * as ms from 'ms';
import { RedisClientType, createClient } from 'redis';

import { env } from '@/env/env.module';

import {
	REDIS_CACHE_CLIENT,
	REDIS_QUEUE_CLIENT,
	REDIS_SESSION_CLIENT,
	REDIS_SESSION_STORE,
	connectionOptions,
} from './redis.config';

export const redisClientProviders: Provider[] = [
	{
		provide: REDIS_SESSION_CLIENT,
		useFactory: () => {
			const c = createClient(connectionOptions.REDIS_SESSION_CLIENT);
			c.connect().catch(console.error);
			return c;
		},
	},

	// {
	// 	provide: REDIS_QUEUE_CLIENT,
	// 	useFactory: () => {
	// 		const c = createClient(connectionOptions.REDIS_QUEUE_CLIENT);
	// 		c.connect().catch(console.error);
	// 		return c;
	// 	},
	// },

	{
		provide: REDIS_CACHE_CLIENT,
		useFactory: () => {
			const c = createClient(connectionOptions.REDIS_CACHE_CLIENT);
			c.connect().catch(console.error);
			return c;
		},
	},
];

export const redisStoreProviders: Provider[] = [
	{
		provide: REDIS_SESSION_STORE,
		useFactory: (sessionClient: RedisClientType) => {
			// const originalSet = sessionClient.set;
			// sessionClient.set = function (...args: any[]) {
			// 	console.log('Redis SET intercepted:', args);
			// 	console.log(
			// 		'Args types:',
			// 		args.map((arg) => typeof arg),
			// 	);
			// 	return originalSet.apply(this, args);
			// };
			return new RedisStore({
				client: sessionClient,
				prefix: 'ses:',
				ttl: Math.floor(ms(env.SESSION_TTL) / 1000),
				// disableTouch: false,
			});
		},
		inject: [REDIS_SESSION_CLIENT],
	},
];

export const redisProviders: Provider[] = [
	...redisClientProviders,
	...redisStoreProviders,
];
