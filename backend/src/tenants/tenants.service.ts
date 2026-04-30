import {  Injectable, NotFoundException, ConflictException  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';

@Injectable()export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        defaultCurrency: true,
        _count: {
          select: {
            users: true,
            categories: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        defaultCurrency: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findBySlug(slug) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug, isActive: true },
      include: {
        defaultCurrency: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async create(createTenantDto) {
    const existingSlug = await this.prisma.tenant.findUnique({
      where: { slug: createTenantDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  async update(id, updateTenantDto) {
    await this.findOne(id);

    if (updateTenantDto.slug) {
      const existingSlug = await this.prisma.tenant.findFirst({
        where: {
          slug: updateTenantDto.slug,
          id: { not: id },
        },
      });

      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id) {
    await this.findOne(id);

    return this.prisma.tenant.delete({
      where: { id },
    });
  }
}
