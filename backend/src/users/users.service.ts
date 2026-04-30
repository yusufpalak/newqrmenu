import {  Injectable, NotFoundException, ConflictException, ForbiddenException  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userTenantId, userRole) {
    const where = userRole === 'SUPERADMIN' ? {} : { tenantId: userTenantId };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id, userTenantId, userRole) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userRole !== 'SUPERADMIN' && user.tenantId !== userTenantId) {
      throw new ForbiddenException('Access denied');
    }

    return user;
  }

  async create(createUserDto, creatorRole) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: creatorRole === 'SUPERADMIN' ? (createUserDto.role || 'USER') : 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id, updateUserDto, userTenantId, userRole) {
    await this.findOne(id, userTenantId, userRole);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id, userTenantId, userRole) {
    await this.findOne(id, userTenantId, userRole);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
