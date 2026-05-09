import { Controller, Get, Param } from '@nestjs/common';

@Controller('orgs')
export class OrganizationsController {
  @Get(':orgId')
  findOne(@Param('orgId') orgId: string) {
    return { id: orgId, name: 'Demo Organization' };
  }
}
