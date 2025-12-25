import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
	APP_FILTER,
	APP_GUARD,
	APP_INTERCEPTOR,
	APP_PIPE,
	HttpAdapterHost,
} from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { RequestHandler } from 'express';
import * as ms from 'ms';
import { PrismaModule } from 'nestjs-prisma';
import * as passport from 'passport';

import { config } from '@/config/config.module';

import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { prismaExceptionFilter } from './filters/prisma-exception.filter';
// import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { GlobalThrottlerGuard } from './guards/throttle.guard';
import { cookieMiddleware } from './middlewares/cookie.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import { SessionMiddleware } from './middlewares/session.middleware';
import { globalValidationPipe } from './pipes/validation.pipe';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
	imports: [
		PrismaModule.forRoot({
			isGlobal: true,
			prismaServiceOptions: {
				prismaOptions: { datasourceUrl: config.APP_DATABASE_URL },
			},
		}),
		RedisModule,
		ThrottlerModule.forRoot([
			{
				ttl: ms('1 minute'),
				limit: 100,
			},
		]),
	],
	providers: [
		SessionMiddleware,
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useFactory: prismaExceptionFilter,
			inject: [HttpAdapterHost],
		},
		{
			provide: APP_PIPE,
			useValue: globalValidationPipe,
		},
		// {
		// 	provide: APP_INTERCEPTOR,
		// 	useClass: LoggingInterceptor,
		// },
		{
			provide: APP_GUARD,
			useClass: GlobalThrottlerGuard,
		},
	],
	exports: [RedisModule, PrismaModule],
})
export class CommonModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(
				securityMiddleware,
				cookieMiddleware,
				SessionMiddleware,
				// passport.initialize(),
				passport.session() as RequestHandler,
			)
			.forRoutes('*');
	}
}
