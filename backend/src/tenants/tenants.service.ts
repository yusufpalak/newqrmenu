import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Role } from '../common/enums/role.enum';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  findAll(user: IAuthenticatedUser): Promise<Tenant[]> {
    if (user.role === Role.SUPERADMIN) {
      return this.tenantRepo.find({
        relations: { defaultCurrency: true },
        order: { createdAt: 'DESC' },
      });
    }
    if (!user.tenantId) return Promise.resolve([]);
    return this.tenantRepo.find({
      where: { id: user.tenantId },
      relations: { defaultCurrency: true },
    });
  }

  async findOne(id: string, user: IAuthenticatedUser): Promise<Tenant> {
    const t = await this.tenantRepo.findOne({
      where: { id },
      relations: { defaultCurrency: true },
    });
    if (!t) throw new NotFoundException('Tenant not found');
    if (user.role !== Role.SUPERADMIN && user.tenantId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return t;
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const exists = await this.tenantRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Slug already in use');
    return this.tenantRepo.save(this.tenantRepo.create(dto));
  }

  async update(
    id: string,
    dto: UpdateTenantDto,
    user: IAuthenticatedUser,
  ): Promise<Tenant> {
    const t = await this.findOne(id, user);
    if (dto.slug && dto.slug !== t.slug) {
      const exists = await this.tenantRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('Slug already in use');
    }
    Object.assign(t, dto);
    return this.tenantRepo.save(t);
  }

  async remove(id: string): Promise<{ success: true }> {
    const t = await this.tenantRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Tenant not found');
    await this.tenantRepo.delete(id);
    return { success: true };
  }

  async assignSubscription(
    id: string,
    plan: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    expiresAt?: Date,
  ): Promise<Tenant> {
    const t = await this.tenantRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Tenant not found');

    const now = new Date();
    // If expiresAt not provided, calculate from plan
    if (!expiresAt) {
      const planDays: Record<string, number> = {
        DAILY: 1,
        WEEKLY: 7,
        MONTHLY: 30,
        YEARLY: 365,
      };
      expiresAt = new Date(now.getTime() + planDays[plan] * 24 * 60 * 60 * 1000);
    }

    t.subscriptionPlan = plan;
    t.subscriptionExpiresAt = expiresAt;
    t.isActive = true;
    return this.tenantRepo.save(t);
  }

  isSubscriptionActive(tenant: Tenant): boolean {
    if (!tenant.subscriptionExpiresAt) return false;
    return new Date() < new Date(tenant.subscriptionExpiresAt);
  }
}
