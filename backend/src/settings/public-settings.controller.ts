import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SettingsService } from './settings.service';

@Controller('public/settings')
@Public()
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('contact')
  getContactSettings() {
    return this.settingsService.getContactSettings();
  }
}
