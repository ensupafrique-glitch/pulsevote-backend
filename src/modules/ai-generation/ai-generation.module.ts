import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiGenerationController } from './ai-generation.controller';
import { AiGenerationService } from './ai-generation.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'survey-generation' })],
  controllers: [AiGenerationController],
  providers: [AiGenerationService],
})
export class AiGenerationModule {}
