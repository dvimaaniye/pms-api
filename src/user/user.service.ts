import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';

import { Prisma, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';

import { HashService } from '@/hash/hash.service';

import { CreateUserDto } from './dto';
import {
	USER_DELETED_EVENT,
	UserDeletedEvent,
} from './event/user-deleted.event';
import { PublicUser } from './types';

@Injectable()
export class UserService {
	private readonly publicUserConfig = { omit: { password: true } } as const;
	private readonly userIdOnlyConfig = { select: { id: true } } as const;

	constructor(
		private readonly prisma: PrismaService,
		private readonly hashService: HashService,
		private readonly eventEmitter: EventEmitter,
	) {}

	async create(user: CreateUserDto): Promise<PublicUser> {
		const passwordHash = await this.hashService.hash(user.password);

		user.password = passwordHash;

		const createdUser = await this.prisma.user.create({
			data: user,
			...this.publicUserConfig,
		});

		return createdUser;
	}

	async findAll(): Promise<PublicUser[]> {
		const users = await this.prisma.user.findMany(this.publicUserConfig);
		return users;
	}

	async findOne(id: User['id']): Promise<PublicUser | null> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			...this.publicUserConfig,
		});
		return user;
	}

	async findOneAndSelect(
		id: User['id'],
		select: Omit<Prisma.UserSelect<DefaultArgs>, 'password'>,
	) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select,
		});
		return user;
	}

	async findOneWhere(
		where: Prisma.UserWhereUniqueInput,
	): Promise<PublicUser | null> {
		const user = await this.prisma.user.findUnique({
			where,
			...this.publicUserConfig,
		});
		return user;
	}

	// For authentication - returns user with password for verification
	async findOneWithPassword(id: PublicUser['id']): Promise<User | null> {
		const user = await this.prisma.user.findUnique({ where: { id } });
		return user;
	}

	async findFirstWithPasswordWhere(
		where: Prisma.UserWhereInput,
	): Promise<User | null> {
		const user = await this.prisma.user.findFirst({ where });
		return user;
	}

	async findOneWithPasswordWhere(
		where: Prisma.UserWhereUniqueInput,
	): Promise<User | null> {
		const user = await this.prisma.user.findUnique({ where });
		return user;
	}

	async update(
		id: User['id'],
		data: Prisma.UserUpdateInput,
		currentUser?: PublicUser | null,
	): Promise<PublicUser> {
		currentUser = currentUser || (await this.findOne(id));
		if (!currentUser) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		if (data.email && currentUser.email !== data.email) {
			data.isEmailVerified = false;
		}
		// If password is being updated, hash it first
		if (data.password && typeof data.password === 'string') {
			data.password = await this.hashService.hash(data.password);
		}
		const user = await this.prisma.user.update({
			where: { id },
			data: data,
			...this.publicUserConfig,
		});
		return user;
	}

	async delete(id: User['id']): Promise<PublicUser> {
		const userChecks = await this.prisma.user.findUnique({
			where: { id },
			select: {
				_count: {
					select: {
						ownedOrganizations: true,
						ownedProjects: true,
					},
				},
			},
		});

		if (!userChecks) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		if (userChecks._count.ownedOrganizations > 0) {
			throw new ConflictException(
				'Cannot delete user. You must delete or transfer ownership of your Organizations first.',
			);
		}

		if (userChecks._count.ownedProjects > 0) {
			throw new ConflictException(
				'Cannot delete user. You must delete or transfer ownership of your Projects first.',
			);
		}

		const user = await this.prisma.user.delete({
			where: { id },
			...this.publicUserConfig,
		});

		this.eventEmitter.emit(USER_DELETED_EVENT, new UserDeletedEvent(user));
		return user;
	}

	async exists(id: User['id']): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			...this.userIdOnlyConfig,
		});
		return !!user;
	}

	async count(): Promise<number> {
		return this.prisma.user.count();
	}
}
