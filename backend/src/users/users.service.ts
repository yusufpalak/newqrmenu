import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/enums/role.enum';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  findAll(user: IAuthenticatedUser): Promise<User[]> {
    const where = user.tenantId ? { tenantId: user.tenantId } : {};
    return this.userRepo.find({
      where,
      relations: { tenant: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: IAuthenticatedUser): Promise<User> {
    const u = await this.userRepo.findOne({
      where: { id },
      relations: { tenant: true },
    });
    if (!u) throw new NotFoundException('User not found');
    if (user.tenantId && u.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    return u;
  }

  async create(dto: CreateUserDto, user: IAuthenticatedUser): Promise<User> {
    if (user.role !== Role.SUPERADMIN) {
      if (dto.role === Role.SUPERADMIN) {
        throw new ForbiddenException('Cannot create SUPERADMIN');
      }
      dto.tenantId = user.tenantId ?? undefined;
    }
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const entity = this.userRepo.create({
      ...dto,
      password: hash,
      tenantId: dto.tenantId ?? null,
    });
    return this.userRepo.save(entity);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    user: IAuthenticatedUser,
  ): Promise<User> {
    const u = await this.findOne(id, user);
    if (user.role !== Role.SUPERADMIN && dto.role === Role.SUPERADMIN) {
      throw new ForbiddenException('Cannot escalate to SUPERADMIN');
    }
    const updates: Partial<User> = { ...dto } as Partial<User>;
    if (dto.password) updates.password = await bcrypt.hash(dto.password, 10);
    Object.assign(u, updates);
    return this.userRepo.save(u);
  }

  async remove(
    id: string,
    user: IAuthenticatedUser,
  ): Promise<{ success: true }> {
    const u = await this.findOne(id, user);
    await this.userRepo.delete(u.id);
    return { success: true };
  }
}
