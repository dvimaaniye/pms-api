import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from '@/auth/auth.module';
import { CommonModule } from '@/common/common.module';
import { REDIS_DATABASE } from '@/common/redis/redis.config';
import { ConfigModule, config } from '@/config/config.module';
import { OrganizationModule } from '@/organization/organization.module';
import { ProjectModule } from '@/project/project.module';
import { TaskModule } from '@/task/task.module';
import { UserModule } from '@/user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule,
		CommonModule,
		BullModule.forRoot({
			connection: {
				url: config.REDIS_URL,
				db: REDIS_DATABASE.QUEUE,
			},
		}),
		ScheduleModule.forRoot(),
		EventEmitterModule.forRoot(),
		UserModule,
		OrganizationModule,
		ProjectModule,
		TaskModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
