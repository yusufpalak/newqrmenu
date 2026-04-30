import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { TranslateTextDto } from './dto/translate-text.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { BlogPost } from './entities/blog-post.entity';
import {
  TranslateService,
  SupportedLocale,
} from '../translate/translate.service';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly service: BlogService,
    private readonly translate: TranslateService,
  ) {}

  // ----- Public -----

  @Public()
  @Get('public')
  publicList(@Query('locale') locale = 'tr'): Promise<BlogPost[]> {
    return this.service.findPublishedList(locale);
  }

  @Public()
  @Get('public/:slug')
  publicDetail(
    @Param('slug') slug: string,
    @Query('locale') locale = 'tr',
  ): Promise<BlogPost> {
    return this.service.findPublishedBySlug(slug, locale);
  }

  // ----- Admin (SUPERADMIN only) -----

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  list(): Promise<BlogPost[]> {
    return this.service.findAllAdmin();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  detail(@Param('id', ParseUUIDPipe) id: string): Promise<BlogPost> {
    return this.service.findOneAdmin(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  create(
    @Body() dto: CreateBlogPostDto,
    @CurrentUser() user: IAuthenticatedUser,
  ): Promise<BlogPost> {
    return this.service.create(dto, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogPostDto,
  ): Promise<BlogPost> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: true }> {
    return this.service.remove(id);
  }

  /** Translate a single snippet (used by admin "auto-translate field" UI). */
  @Post('translate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async translateText(
    @Body() dto: TranslateTextDto,
  ): Promise<{ text: string }> {
    const out = await this.translate.translateText(
      dto.text,
      dto.source as SupportedLocale,
      dto.target as SupportedLocale,
    );
    return { text: out };
  }
}
