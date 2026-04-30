import {  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import {  CurrenciesService  } from './currencies.service';
import {  JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import {  RolesGuard  } from '../auth/guards/roles.guard';
import {  Roles  } from '../common/decorators/roles.decorator';

@Controller('currencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CurrenciesController {
  constructor(private currenciesService: CurrenciesService) {}

  @Get()
  findAll() {
    return this.currenciesService.findAll();
  }

  @Get(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  findOne(@Param('id') id) {
    return this.currenciesService.findOne(id);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  create(@Body() data) {
    return this.currenciesService.create(data);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  update(@Param('id') id, @Body() data) {
    return this.currenciesService.update(id, data);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  remove(@Param('id') id) {
    return this.currenciesService.remove(id);
  }
}
