import {  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request  } from '@nestjs/common';
import {  CategoriesService  } from './categories.service';
import {  CreateCategoryDto  } from './dto/create-category.dto';
import {  UpdateCategoryDto  } from './dto/update-category.dto';
import {  JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import {  RolesGuard  } from '../auth/guards/roles.guard';
import {  Roles  } from '../common/decorators/roles.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @Roles('SUPERADMIN', 'ADMIN', 'USER')
  findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.tenantId, req.user.role);
  }

  @Get(':id')
  @Roles('SUPERADMIN', 'ADMIN', 'USER')
  findOne(@Param('id') id, @Request() req) {
    return this.categoriesService.findOne(id, req.user.tenantId, req.user.role);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(createCategoryDto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  update(@Param('id') id, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req) {
    return this.categoriesService.update(id, updateCategoryDto, req.user.tenantId, req.user.role);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  remove(@Param('id') id, @Request() req) {
    return this.categoriesService.remove(id, req.user.tenantId, req.user.role);
  }
}
