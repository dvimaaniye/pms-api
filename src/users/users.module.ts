import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import PrismaModule from 'src/prisma/prisma.module';
import { HashModule } from 'src/hash/hash.module';

@Module({
	imports: [PrismaModule, HashModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
