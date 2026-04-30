import {  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request  } from '@nestjs/common';
import {  SubCategoriesService  } from './sub-categories.service';
import {  CreateSubCategoryDto  } from './dto/create-subcategory.dto';
import {  UpdateSubCategoryDto  } from './dto/update-subcategory.dto';
import {  JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import {  RolesGuard  } from '../auth/guards/roles.guard';
import {  Roles  } from '../common/decorators/roles.decorator';

@Controller('sub-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubCategoriesController {
  constructor(private subCategoriesService: SubCategoriesService) {}

  @Get()
  @Roles('SUPERADMIN', 'ADMIN', 'USER')
  findAll(@Request() req) {
    return this.subCategoriesService.findAll(req.user.tenantId, req.user.role);
  }

  @Get(':id')
  @Roles('SUPERADMIN', 'ADMIN', 'USER')
  findOne(@Param('id') id, @Request() req) {
    return this.subCategoriesService.findOne(id, req.user.tenantId, req.user.role);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  create(@Body() createSubCategoryDto: CreateSubCategoryDto, @Request() req) {
    return this.subCategoriesService.create(createSubCategoryDto, req.user.tenantId, req.user.role);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  update(@Param('id') id, @Body() updateSubCategoryDto: UpdateSubCategoryDto, @Request() req) {
    return this.subCategoriesService.update(id, updateSubCategoryDto, req.user.tenantId, req.user.role);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  remove(@Param('id') id, @Request() req) {
    return this.subCategoriesService.remove(id, req.user.tenantId, req.user.role);
  }
}
