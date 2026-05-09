import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tenant RLS (e2e skeleton)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('denies access without JWT on tenant endpoints', async () => {
    await request(app.getHttpServer()).get('/api/v1/orgs/00000000-0000-0000-0000-000000000000/surveys').expect(401);
  });
});
