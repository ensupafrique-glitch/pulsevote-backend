import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Magic Link Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts magic link requests', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/magic-link/request')
      .send({ email: 'tester@example.com' })
      .expect((res) => {
        expect([200, 201]).toContain(res.status);
      });
  });
});
