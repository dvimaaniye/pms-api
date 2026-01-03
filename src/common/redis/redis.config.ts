import { RedisClientOptions } from 'redis';

import { env } from '@/env/env.module';

export const baseRedisConnectionOptions: RedisClientOptions = {
	url: env.REDIS_URL,
};

export const REDIS_SESSION_CLIENT = 'REDIS_SESSION_CLIENT';
export const REDIS_QUEUE_CLIENT = 'REDIS_QUEUE_CLIENT';
export const REDIS_CACHE_CLIENT = 'REDIS_CACHE_CLIENT';

export const REDIS_SESSION_STORE = 'REDIS_SESSION_STORE';

export enum REDIS_DATABASE {
	SESSION = 0,
	QUEUE = 1,
	CACHE = 2,
}

export type RedisClientType =
	| typeof REDIS_SESSION_CLIENT
	| typeof REDIS_CACHE_CLIENT
	| typeof REDIS_QUEUE_CLIENT;

export const connectionOptions: Record<RedisClientType, RedisClientOptions> = {
	REDIS_SESSION_CLIENT: {
		...baseRedisConnectionOptions,
		database: REDIS_DATABASE.SESSION,
	},

	REDIS_QUEUE_CLIENT: {
		...baseRedisConnectionOptions,
		database: REDIS_DATABASE.QUEUE,
	},

	REDIS_CACHE_CLIENT: {
		...baseRedisConnectionOptions,
		database: REDIS_DATABASE.CACHE,
	},
};
