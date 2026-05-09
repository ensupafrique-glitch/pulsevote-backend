import { Controller, Get, Param } from '@nestjs/common';

@Controller('orgs/:orgId/analytics')
export class AnalyticsController {
  @Get('surveys/:surveyId')
  surveyResults(@Param('orgId') orgId: string, @Param('surveyId') surveyId: string) {
    return { orgId, surveyId, status: 'placeholder-analytics' };
  }
}
