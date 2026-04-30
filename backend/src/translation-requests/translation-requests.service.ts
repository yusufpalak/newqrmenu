import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationRequest } from './entities/translation-request.entity';
import {
  CreateTranslationRequestDto,
  UpdateTranslationRequestDto,
} from './dto/translation-request.dto';
import { Role } from '../common/enums/role.enum';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class TranslationRequestsService {
  constructor(
    @InjectRepository(TranslationRequest)
    private readonly repo: Repository<TranslationRequest>,
  ) {}

  findAll(user: IAuthenticatedUser): Promise<TranslationRequest[]> {
    const qb = this.repo
      .createQueryBuilder('tr')
      .leftJoinAndSelect('tr.tenant', 't')
      .leftJoinAndSelect('tr.requestedBy', 'u')
      .orderBy('tr.createdAt', 'DESC');
    if (user.role !== Role.SUPERADMIN) {
      qb.andWhere('tr.tenantId = :tenantId', { tenantId: user.tenantId });
    }
    return qb.getMany();
  }

  async findOne(
    id: string,
    user: IAuthenticatedUser,
  ): Promise<TranslationRequest> {
    const tr = await this.repo.findOne({
      where: { id },
      relations: { tenant: true, requestedBy: true },
    });
    if (!tr) throw new NotFoundException('TranslationRequest not found');
    if (user.role !== Role.SUPERADMIN && tr.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    return tr;
  }

  async create(
    dto: CreateTranslationRequestDto,
    user: IAuthenticatedUser,
  ): Promise<TranslationRequest> {
    const tenantId =
      user.role === Role.SUPERADMIN ? dto.tenantId : user.tenantId;
    if (!tenantId) throw new BadRequestException('tenantId required');
    return this.repo.save(
      this.repo.create({
        tenantId,
        requestedByUserId: user.userId,
        targetLocale: dto.targetLocale,
        entityType: dto.entityType,
        entityId: dto.entityId ?? null,
        note: dto.note ?? null,
        price:
          dto.price !== undefined && dto.price !== null
            ? dto.price.toFixed(2)
            : null,
      }),
    );
  }

  async update(
    id: string,
    dto: UpdateTranslationRequestDto,
    user: IAuthenticatedUser,
  ): Promise<TranslationRequest> {
    const tr = await this.findOne(id, user);
    if (dto.status !== undefined && user.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Only SUPERADMIN can change status');
    }
    if (dto.status !== undefined) tr.status = dto.status;
    if (dto.note !== undefined) tr.note = dto.note;
    if (dto.price !== undefined) tr.price = dto.price.toFixed(2);
    return this.repo.save(tr);
  }

  async remove(
    id: string,
    user: IAuthenticatedUser,
  ): Promise<{ success: true }> {
    const tr = await this.findOne(id, user);
    await this.repo.delete(tr.id);
    return { success: true };
  }
}
