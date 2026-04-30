import {  Controller, Get, Post, Body, Patch, Param, UseGuards, Request  } from '@nestjs/common';
import {  TranslationRequestsService  } from './translation-requests.service';
import {  CreateTranslationRequestDto  } from './dto/create-translation-request.dto';
import {  JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import {  RolesGuard  } from '../auth/guards/roles.guard';
import {  Roles  } from '../common/decorators/roles.decorator';

@Controller('translation-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TranslationRequestsController {
  constructor(private service: TranslationRequestsService) {}

  @Get()
  @Roles('SUPERADMIN', 'ADMIN')
  findAll(@Request() req) {
    return this.service.findAll(req.user.tenantId, req.user.role);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateTranslationRequestDto, @Request() req) {
    return this.service.create(dto, req.user.userId, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('SUPERADMIN')
  update(@Param('id') id, @Body() data, @Request() req) {
    return this.service.update(id, data, req.user.role);
  }
}
