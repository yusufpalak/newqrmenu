import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSetting } from './entities/site-setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PublicSettingsController } from './public-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSetting])],
  providers: [SettingsService],
  controllers: [SettingsController, PublicSettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
