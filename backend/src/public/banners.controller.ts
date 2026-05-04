import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsHexColor, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from '../public/entities/banner.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

class CreateBannerDto {
  @IsString() @MaxLength(255) title!: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsHexColor() bgColor?: string;
  @IsOptional() @IsHexColor() textColor?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
}

@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN)
export class BannersController {
  constructor(
    @InjectRepository(Banner) private readonly bannerRepo: Repository<Banner>,
  ) {}

  /** JWT strategy sets tenantId from x-tenant-id for SUPERADMIN; never list all tenants. */
  private assertBannerTenant(user: IAuthenticatedUser, banner: Banner): void {
    if (!user.tenantId) {
      throw new ForbiddenException('Restoran bağlamı gerekli');
    }
    if (banner.tenantId !== user.tenantId) {
      throw new ForbiddenException();
    }
  }

  @Get()
  findAll(@CurrentUser() user: IAuthenticatedUser): Promise<Banner[]> {
    if (!user.tenantId) {
      return Promise.resolve([]);
    }
    return this.bannerRepo.find({
      where: { tenantId: user.tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  @Post()
  create(
    @Body() dto: CreateBannerDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<Banner> {
    if (!user.tenantId) {
      throw new BadRequestException('Restoran bağlamı gerekli; panelden restoran seçin.');
    }
    return this.bannerRepo.save(this.bannerRepo.create({
      ...dto,
      tenantId: user.tenantId,
      bgColor: dto.bgColor ?? '#F59E0B',
      textColor: dto.textColor ?? '#1C1917',
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    }));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateBannerDto>,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<Banner> {
    const banner = await this.bannerRepo.findOneOrFail({ where: { id } });
    this.assertBannerTenant(user, banner);
    const { tenantId: _ignoreTenant, ...patch } = dto as CreateBannerDto & { tenantId?: string };
    Object.assign(banner, patch);
    if (dto.startsAt) banner.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) banner.endsAt = new Date(dto.endsAt);
    return this.bannerRepo.save(banner);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<{ success: true }> {
    const banner = await this.bannerRepo.findOneOrFail({ where: { id } });
    this.assertBannerTenant(user, banner);
    await this.bannerRepo.delete(id);
    return { success: true };
  }
}
