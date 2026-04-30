import {  Injectable  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';

@Injectable()export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id) {
    return this.prisma.currency.findUnique({ where: { id } });
  }

  async create(data) {
    return this.prisma.currency.create({ data });
  }

  async update(id, data) {
    return this.prisma.currency.update({ where: { id }, data });
  }

  async remove(id) {
    return this.prisma.currency.delete({ where: { id } });
  }
}
