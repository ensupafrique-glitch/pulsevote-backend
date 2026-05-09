import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SubmitVoteDto } from './dto/submit-vote.dto';
import { AuthUser } from '../../common/types/auth-user.type';

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  submit(orgId: string, surveyId: string, dto: SubmitVoteDto, user: AuthUser) {
    if (user.orgId !== orgId) throw new ForbiddenException('Cross-tenant access denied');
    return this.prisma.withTenant(orgId, (tx) =>
      tx.vote.create({
        data: {
          orgId,
          surveyId,
          questionId: dto.questionId,
          optionId: dto.optionId,
          demographics: dto.demographics ?? {},
        },
      }),
    );
  }
}
