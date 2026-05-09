import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @CurrentUser() user: AuthUser) {
    return this.surveysService.findAll(orgId, user);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateSurveyDto, @CurrentUser() user: AuthUser) {
    return this.surveysService.create(orgId, dto, user);
  }
}
