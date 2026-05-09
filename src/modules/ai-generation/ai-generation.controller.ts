import { Body, Controller, Param, Post } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';

@Controller('orgs/:orgId/ai')
export class AiGenerationController {
  constructor(private readonly aiGenerationService: AiGenerationService) {}

  @Post('generate-survey')
  generate(@Param('orgId') orgId: string, @Body() body: Record<string, unknown>) {
    return this.aiGenerationService.enqueue(orgId, body);
  }
}
