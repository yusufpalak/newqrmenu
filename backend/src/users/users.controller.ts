import {  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request  } from '@nestjs/common';
import {  UsersService  } from './users.service';
import {  CreateUserDto  } from './dto/create-user.dto';
import {  UpdateUserDto  } from './dto/update-user.dto';
import {  JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import {  RolesGuard  } from '../auth/guards/roles.guard';
import {  Roles  } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('SUPERADMIN', 'ADMIN')
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.tenantId, req.user.role);
  }

  @Get(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  findOne(@Param('id') id, @Request() req) {
    return this.usersService.findOne(id, req.user.tenantId, req.user.role);
  }

  @Post()
  @Roles('SUPERADMIN', 'ADMIN')
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user.role);
  }

  @Patch(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  update(@Param('id') id, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user.tenantId, req.user.role);
  }

  @Delete(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  remove(@Param('id') id, @Request() req) {
    return this.usersService.remove(id, req.user.tenantId, req.user.role);
  }
}
