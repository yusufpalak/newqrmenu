import {  Controller, Get, Param, Query, Res, Header  } from '@nestjs/common';
import {  PublicService  } from './public.service';

@Controller('public')export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('menu/:tenantSlug')
  @Header('Cache-Control', 'public, max-age=300')
  async getMenu(
    @Param('tenantSlug') tenantSlug,
    @Query('locale') locale,
    @Query('currency') currency,
  ) {
    return this.publicService.getMenu(tenantSlug, locale, currency);
  }
}
