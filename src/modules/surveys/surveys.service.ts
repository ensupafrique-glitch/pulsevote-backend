import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { AuthUser } from '../../common/types/auth-user.type';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(orgId: string, user: AuthUser) {
    if (user.orgId !== orgId) throw new ForbiddenException('Cross-tenant access denied');
    return this.prisma.withTenant(orgId, (tx) => tx.survey.findMany({ where: { orgId } }));
  }

  create(orgId: string, dto: CreateSurveyDto, user: AuthUser) {
    if (user.orgId !== orgId) throw new ForbiddenException('Cross-tenant access denied');
    return this.prisma.withTenant(orgId, (tx) =>
      tx.survey.create({
        data: {
          orgId,
          title: dto.title,
          description: dto.description,
          slug: dto.title.toLowerCase().replace(/\s+/g, '-'),
          createdBy: user.sub,
        },
      }),
    );
  }
}
