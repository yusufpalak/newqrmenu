import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from './entities/site-setting.entity';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';

export interface IContactSettings {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingRepo: Repository<SiteSetting>,
  ) {}

  private async getOrCreate(): Promise<SiteSetting> {
    const existing = await this.settingRepo.findOne({ where: { id: 1 } });
    if (existing) return existing;
    return this.settingRepo.save(this.settingRepo.create({ id: 1 }));
  }

  async getContactSettings(): Promise<IContactSettings> {
    const s = await this.getOrCreate();
    return {
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      contactAddress: s.contactAddress,
    };
  }

  async updateContactSettings(dto: UpdateContactSettingsDto): Promise<IContactSettings> {
    const s = await this.getOrCreate();
    if (dto.contactEmail !== undefined) s.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) s.contactPhone = dto.contactPhone;
    if (dto.contactAddress !== undefined) s.contactAddress = dto.contactAddress;
    await this.settingRepo.save(s);
    return this.getContactSettings();
  }
}
