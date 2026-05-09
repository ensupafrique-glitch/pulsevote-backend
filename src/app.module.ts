import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { VotesModule } from './modules/votes/votes.module';
import { AiGenerationModule } from './modules/ai-generation/ai-generation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 10 },
      { name: 'medium', ttl: 15 * 60_000, limit: 30 },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: Number(config.get<string>('REDIS_PORT', '6379')),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    SurveysModule,
    VotesModule,
    AiGenerationModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
