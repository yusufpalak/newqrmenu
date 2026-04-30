import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';
import { ContactMessage } from './entities/contact-message.entity';

@Controller('contact')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  /** Public form submit. */
  @Public()
  @Post()
  submit(
    @Body() dto: CreateContactMessageDto,
    @Ip() ip: string,
  ): Promise<{ id: string; success: true }> {
    return this.service.create(dto, ip ?? null).then((m) => ({
      id: m.id,
      success: true,
    }));
  }

  // ----- Admin -----

  @Get('messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  list(@Query('unread') unread?: string): Promise<ContactMessage[]> {
    return this.service.findAll(unread === 'true');
  }

  @Get('messages/unread-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  unreadCount(): Promise<{ unread: number }> {
    return this.service.unreadCount();
  }

  @Get('messages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  detail(@Param('id', ParseUUIDPipe) id: string): Promise<ContactMessage> {
    return this.service.findOne(id);
  }

  @Patch('messages/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { isRead?: boolean },
  ): Promise<ContactMessage> {
    return this.service.markRead(id, body.isRead ?? true);
  }

  @Delete('messages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: true }> {
    return this.service.remove(id);
  }
}
