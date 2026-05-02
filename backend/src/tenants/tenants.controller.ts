import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { Tenant } from './entities/tenant.entity';

class AssignSubscriptionDto {
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])
  plan!: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Get()
  findAll(@CurrentUser() user: IAuthenticatedUser): Promise<Tenant[]> {
    return this.service.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<Tenant> {
    return this.service.findOne(id, user);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(@Body() dto: CreateTenantDto): Promise<Tenant> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<Tenant> {
    return this.service.update(id, dto, user);
  }

  @Patch(':id/subscription')
  @Roles(Role.SUPERADMIN)
  assignSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignSubscriptionDto,
  ): Promise<Tenant> {
    return this.service.assignSubscription(
      id,
      dto.plan,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: true }> {
    return this.service.remove(id);
  }
}
