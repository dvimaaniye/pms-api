import { MailerModule } from '@nestjs-modules/mailer';

import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE, HttpAdapterHost } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { RequestHandler } from 'express';
import * as ms from 'ms';
import { PrismaModule } from 'nestjs-prisma';
import * as passport from 'passport';

import { env } from '@/env/env.module';

import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { prismaExceptionFilter } from './filters/prisma-exception.filter';
import { GlobalThrottlerGuard } from './guards/throttle.guard';
import { cookieMiddleware } from './middlewares/cookie.middleware';
import { securityMiddleware } from './middlewares/security.middleware';
import { SessionMiddleware } from './middlewares/session.middleware';
import { globalValidationPipe } from './pipes/global-validation.pipe';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: env.MAIL_HOST,
				port: env.MAIL_PORT,
				secure: env.isProd,
				auth: {
					user: env.MAIL_USER,
					pass: env.MAIL_PASSWORD,
				},
			},
			defaults: {
				from: env.MAIL_FROM,
			},
		}),
		PrismaModule.forRoot({
			isGlobal: true,
			prismaServiceOptions: {
				prismaOptions: { datasourceUrl: env.APP_DATABASE_URL },
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
		{
			provide: APP_GUARD,
			useClass: GlobalThrottlerGuard,
		},
	],
	exports: [MailerModule, RedisModule, PrismaModule],
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
