import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { VerifiedSessionAuthGuard } from '@/common/guards/verified-session-auth.guard';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { DeleteInviteDto } from './dto/delete-invite.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateInviteStatusDto } from './dto/update-invite-status.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationService } from './organization.service';

@Controller('organizations')
@UseGuards(VerifiedSessionAuthGuard)
export class OrganizationController {
	constructor(private readonly organizationService: OrganizationService) {}

	@Post()
	create(
		@CurrentUser() user: Express.User,
		@Body() createOrganizationDto: CreateOrganizationDto,
	) {
		console.log(user);
		return this.organizationService.create(user.id, createOrganizationDto);
	}

	@Get()
	findAll(@CurrentUser() user: Express.User) {
		return this.organizationService.findAllForUser(user.id);
	}

	@Get(':id')
	findOne(@Param('id') id: string, @CurrentUser() user: Express.User) {
		return this.organizationService.findOne(id, user.id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateOrganizationDto: UpdateOrganizationDto,
	) {
		return this.organizationService.update(id, updateOrganizationDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.organizationService.remove(id);
	}

	@Post(':id/invite')
	invite(@Param('id') id: string, @Body() inviteUserDto: InviteUserDto) {
		return this.organizationService.invite(id, inviteUserDto);
	}

	@Delete(':id/invite')
	removeInvite(
		@Param('id') id: string,
		@Body() deleteInviteDto: DeleteInviteDto,
	) {
		return this.organizationService.removeInvite(id, deleteInviteDto);
	}

	@Patch(':id/invite')
	updateInviteStatus(
		@Param('id') id: string,
		@CurrentUser() user: Express.User,
		@Body() updateInviteStatusDto: UpdateInviteStatusDto,
	) {
		return this.organizationService.updateInviteStatus(
			id,
			user.email,
			updateInviteStatusDto,
		);
	}
}
