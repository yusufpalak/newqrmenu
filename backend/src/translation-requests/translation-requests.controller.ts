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
import { TranslationRequestsService } from './translation-requests.service';
import {
  CreateTranslationRequestDto,
  UpdateTranslationRequestDto,
} from './dto/translation-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { TranslationRequest } from './entities/translation-request.entity';

@Controller('translation-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN)
export class TranslationRequestsController {
  constructor(private readonly service: TranslationRequestsService) {}

  @Get()
  findAll(
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<TranslationRequest[]> {
    return this.service.findAll(user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<TranslationRequest> {
    return this.service.findOne(id, user);
  }

  @Post()
  create(
    @Body() dto: CreateTranslationRequestDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<TranslationRequest> {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTranslationRequestDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<TranslationRequest> {
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
