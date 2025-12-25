import { Injectable, NotFoundException } from '@nestjs/common';

import {
	InvitationStatus,
	Organization,
	OrganizationRole,
	User,
} from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { PrismaService } from 'nestjs-prisma';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { DeleteInviteDto } from './dto/delete-invite.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateInviteStatusDto } from './dto/update-invite-status.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
	constructor(private readonly prisma: PrismaService) {}

	async create(
		ownerId: User['id'],
		createOrganizationDto: CreateOrganizationDto,
	) {
		const inviteCode = await this.getUniqueInviteCode();
		console.log({ inviteCode });
		return this.prisma.organization.create({
			data: {
				ownerId,
				inviteCode,
				...createOrganizationDto,
				members: {
					create: {
						role: OrganizationRole.OWNER,
						userId: ownerId,
					},
				},
			},
		});
	}

	async findAllForUser(userId: User['id']) {
		const memberships = await this.prisma.organizationMember.findMany({
			where: {
				userId,
			},
			select: {
				role: true,
				joinedAt: true,
				organization: {
					select: {
						id: true,
						name: true,
						inviteCode: true,
						createdAt: true,
						owner: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
							},
						},
						_count: {
							select: {
								members: true,
								projects: true,
							},
						},
					},
				},
			},
			orderBy: {
				joinedAt: 'desc',
			},
		});

		return memberships.map((member) => ({
			id: member.organization.id,
			name: member.organization.name,
			inviteCode: member.organization.inviteCode,
			createdAt: member.organization.createdAt,
			membership: {
				role: member.role,
				joinedAt: member.joinedAt,
			},
			owner: {
				id: member.organization.owner.id,
				firstName: member.organization.owner.firstName,
				lastName: member.organization.owner.lastName ?? '',
			},
			stats: {
				membersCount: member.organization._count.members,
				projectsCount: member.organization._count.projects,
			},
		}));
	}

	async findOne(id: Organization['id'], userId: User['id']) {
		const member = await this.prisma.organizationMember.findUnique({
			where: {
				userId_organizationId: {
					organizationId: id,
					userId: userId,
				},
			},
			select: {
				role: true,
				joinedAt: true,
				organization: {
					select: {
						id: true,
						name: true,
						inviteCode: true,
						createdAt: true,
						owner: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
							},
						},
						_count: {
							select: {
								members: true,
								projects: true,
							},
						},
					},
				},
			},
		});

		if (!member) {
			throw new NotFoundException(`Organization not found`);
		}

		return {
			id: member.organization.id,
			name: member.organization.name,
			inviteCode: member.organization.inviteCode,
			createdAt: member.organization.createdAt,

			membership: {
				role: member.role,
				joinedAt: member.joinedAt,
			},

			owner: {
				id: member.organization.owner.id,
				firstName: member.organization.owner.firstName,
				lastName: member.organization.owner.lastName ?? '',
			},

			stats: {
				membersCount: member.organization._count.members,
				projectsCount: member.organization._count.projects,
			},
		};
	}

	update(id: Organization['id'], updateOrganizationDto: UpdateOrganizationDto) {
		return this.prisma.organization.update({
			where: { id },
			data: { ...updateOrganizationDto },
		});
	}

	remove(id: Organization['id']) {
		return this.prisma.organization.delete({ where: { id } });
	}

	async invite(id: Organization['id'], inviteUserDto: InviteUserDto) {
		console.log(
			`send invitation email to ${inviteUserDto.email} for ${inviteUserDto.role} role`,
		);
		const org = await this.prisma.organization.findFirst({ where: { id } });
		if (!org) {
			throw new NotFoundException(`Organization with ID ${id} not found`);
		}
		return this.prisma.organizationInvitation.create({
			data: {
				...inviteUserDto,
				status: InvitationStatus.PENDING,
				organizationId: id,
			},
		});
	}

	removeInvite(id: Organization['id'], deleteInviteDto: DeleteInviteDto) {
		return this.prisma.organizationInvitation.delete({
			where: {
				email_organizationId: {
					email: deleteInviteDto.email,
					organizationId: id,
				},
			},
		});
	}

	updateInviteStatus(
		id: Organization['id'],
		email: string,
		updateInviteStatusDto: UpdateInviteStatusDto,
	) {
		return this.prisma.organizationInvitation.update({
			where: {
				email_organizationId: {
					email,
					organizationId: id,
				},
			},
			data: {
				status: updateInviteStatusDto.status,
			},
		});
	}

	private createInviteCode() {
		return customAlphabet(
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
			8,
		)();
	}

	private async getUniqueInviteCode() {
		let inviteCode: string;
		let isUnique: boolean;
		do {
			inviteCode = this.createInviteCode();
			isUnique =
				(await this.prisma.organization.count({
					where: { inviteCode },
				})) === 0
					? true
					: false;
		} while (!isUnique);
		return inviteCode;
	}
}
