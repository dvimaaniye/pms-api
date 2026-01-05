import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { Prisma, User } from '@prisma/client';
import axios from 'axios';
import mailhog from 'mailhog';
import { PrismaService } from 'nestjs-prisma';
import * as request from 'supertest';

import { AppModule } from '@/app/app.module';
import { env } from '@/env/env.module';

import { UserFactory } from './factories/user.factory';

function extractVerificationLink(htmlBody: string): string {
  const match = htmlBody.match(/href=['"]([^'"]+)['"]/);

  if (!match || !match[1]) {
    throw new Error('Verification link not found in email body');
  }

  return match[1];
}
describe('App', () => {
  let app: INestApplication;
  let userFactory: UserFactory;
  let testUser: Prisma.UserCreateInput;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    userFactory = moduleRef.get(UserFactory);
    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it(`/GET check`, () => {
    request(app.getHttpServer())
      .get('/check')
      .expect(HttpStatus.OK)
      .expect('check');
  });

  it('Should register user', async () => {
    testUser = userFactory.make();
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(HttpStatus.CREATED);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: testUser.email.toLowerCase(),
        username: testUser.username.toLowerCase(),
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        isEmailVerified: false,
        createdAt: new Date(res.body.createdAt).toISOString(),
        modifiedAt: new Date(res.body.modifiedAt).toISOString(),
        deletedAt: null,
      }),
    );
  });

  it('Should not register the user again', () => {
    request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(HttpStatus.CONFLICT);
  });

  it('Should sign in the user', () => {
    request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ username: testUser.username, password: testUser.password })
      .expect(HttpStatus.OK)
      .expect(testUser);
  });

  // it('Should verify email through emailed link', async () => {
  //   const mailhogRes = await axios.get(
  //     `http://${env.MAIL_HOST}:${env.MAIL_API_PORT}/api/v2/messages?limit=1`,
  //   );
  //   console.log(mailhogRes.data);
  //   expect(mailhogRes.data.items.length).toBeGreaterThan(0);
  //   const latestEmailMessage = mailhogRes.data.items[0];
  //   const mail_to = latestEmailMessage['Content']['Headers']['To'];
  //   expect(mail_to).toEqual(testUser.email);
  //
  //   const encodedEmailBody = latestEmailMessage['Content']['Body'];
  //   const mailhogClient = mailhog({ host: env.MAIL_HOST });
  //   const decodedEmailBody = mailhogClient.decode(encodedEmailBody);
  //   const verificationLink = extractVerificationLink(decodedEmailBody);
  //   request(app.getHttpServer())
  //     .get(verificationLink.replace(env.BASE_URL, ''))
  //     .expect(HttpStatus.OK);
  // });
});
