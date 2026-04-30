import {  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request  } from '@nestjs/common';
import {  ProductsService  } from './products.service';
import {  CreateProductDto  } from './dto/create-product.dto';
import {  UpdateProductDto  } from './dto/update-product.dto';
import {  JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import {  RolesGuard  } from '../auth/guards/roles.guard';
import {  Roles  } from '../common/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Roles('SUPERADMIN', 'ADMIN', 'USER')
  findAll(@Request() req) {
    return this.productsService.findAll(req.user.tenantId, req.user.role);
  }

  @Get(':id')
  @Roles('SUPERADMIN', 'ADMIN', 'USER')
  findOne(@Param('id') id, @Request() req) {
    return this.productsService.findOne(id, req.user.tenantId, req.user.role);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.tenantId);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  update(@Param('id') id, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    return this.productsService.update(id, updateProductDto, req.user.tenantId, req.user.role);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  remove(@Param('id') id, @Request() req) {
    return this.productsService.remove(id, req.user.tenantId, req.user.role);
  }
}
