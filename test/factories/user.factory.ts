import { Injectable } from '@nestjs/common';

import { faker } from '@faker-js/faker';
import { Prisma, User } from '@prisma/client';

import { BaseFactory } from './base.factory';

@Injectable()
export class UserFactory extends BaseFactory<User, Prisma.UserCreateInput> {
  protected get model() {
    return this.prisma.user;
  }

  definition(): Prisma.UserCreateInput {
    return {
      email: faker.internet.email(),
      username: faker.internet.username().replace(/[^a-zA-Z_]/g, ''),
      password: 'Password123!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName().replace(/[^a-zA-Z]/g, ''),
      isEmailVerified: false,
    };
  }
}
