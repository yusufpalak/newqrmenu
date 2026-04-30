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
import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { SubCategory } from './entities/sub-category.entity';

@Controller('sub-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN)
export class SubCategoriesController {
  constructor(private readonly service: SubCategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: IAuthenticatedUser): Promise<SubCategory[]> {
    return this.service.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<SubCategory> {
    return this.service.findOne(id, user);
  }

  @Post()
  create(
    @Body() dto: CreateSubCategoryDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<SubCategory> {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubCategoryDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<SubCategory> {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<{ success: true }> {
    return this.service.remove(id, user);
  }
}
