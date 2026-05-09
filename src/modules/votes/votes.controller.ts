import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@UseGuards(JwtAuthGuard)
@Controller('orgs/:orgId/surveys/:surveyId/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  submit(
    @Param('orgId') orgId: string,
    @Param('surveyId') surveyId: string,
    @Body() dto: SubmitVoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.votesService.submit(orgId, surveyId, dto, user);
  }
}
