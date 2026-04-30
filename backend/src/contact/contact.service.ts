import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly repo: Repository<ContactMessage>,
  ) {}

  create(
    dto: CreateContactMessageDto,
    ipAddress: string | null,
  ): Promise<ContactMessage> {
    const entity = this.repo.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim() ?? null,
      subject: dto.subject?.trim() ?? null,
      message: dto.message.trim(),
      locale: dto.locale ?? 'tr',
      ipAddress,
    });
    return this.repo.save(entity);
  }

  findAll(unreadOnly: boolean): Promise<ContactMessage[]> {
    const qb = this.repo
      .createQueryBuilder('m')
      .orderBy('m.createdAt', 'DESC');
    if (unreadOnly) qb.where('m.isRead = false');
    return qb.getMany();
  }

  async findOne(id: string): Promise<ContactMessage> {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Message not found');
    return m;
  }

  async markRead(id: string, isRead: boolean): Promise<ContactMessage> {
    const m = await this.findOne(id);
    m.isRead = isRead;
    return this.repo.save(m);
  }

  async remove(id: string): Promise<{ success: true }> {
    const m = await this.findOne(id);
    await this.repo.delete(m.id);
    return { success: true };
  }

  async unreadCount(): Promise<{ unread: number }> {
    const unread = await this.repo.count({ where: { isRead: false } });
    return { unread };
  }
}
