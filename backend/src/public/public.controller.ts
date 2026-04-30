import { Controller, Get, Param, Query } from '@nestjs/common';
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
  ) {
    return this.service.getMenu(slug, query);
  }
}
