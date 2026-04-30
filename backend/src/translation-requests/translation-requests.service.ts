import {  Injectable  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';

@Injectable()export class TranslationRequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId, userRole) {
    const where = userRole === 'SUPERADMIN' ? {} : { tenantId };
    return this.prisma.translationRequest.findMany({
      where,
      include: {
        tenant: { select: { name: true, slug: true } },
        requestedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data, userId, tenantId) {
    return this.prisma.translationRequest.create({
      data: {
        ...data,
        userId,
        tenantId,
      },
    });
  }

  async update(id, data, userRole) {
    return this.prisma.translationRequest.update({
      where: { id },
      data,
    });
  }
}
