import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { PublicService, IPublicMenuQuery } from './public.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('public')
@Public()
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('tenants/:slug')
  getTenant(@Param('slug') slug: string) {
    return this.service.getTenantBySlug(slug);
  }

  @Get('menu/:slug')
  getMenu(
    @Param('slug') slug: string,
    @Query() query: IPublicMenuQuery,
    @Req() req: Request,
  ) {
    return this.service.getMenu(slug, query, req);
  }

  @Post('products/:id/view')
  recordView(@Param('id') id: string) {
    return this.service.recordProductView(id);
  }

  @Get('analytics/:tenantId')
  getAnalytics(@Param('tenantId') tenantId: string) {
    return this.service.getAnalytics(tenantId);
  }

  // Banner CRUD for admin (re-exported here for simplicity, protected via tenantId check)
  @Get('banners/:tenantId')
  getBanners(@Param('tenantId') tenantId: string) {
    return this.service.getBanners(tenantId);
  }
}
