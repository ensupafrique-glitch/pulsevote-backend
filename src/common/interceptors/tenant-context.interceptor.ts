import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const orgId = request.params.orgId || request.user?.orgId || request.headers['x-org-id'];
    if (orgId) {
      await this.prisma.setTenantContext(String(orgId));
    }
    return next.handle();
  }
}
