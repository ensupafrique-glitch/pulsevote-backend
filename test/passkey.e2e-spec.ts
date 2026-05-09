import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Passkey Auth (e2e skeleton)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts passkey registration ceremony', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/passkey/register/options?email=tester@example.com')
      .send({ displayName: 'Tester' })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
  });
});
