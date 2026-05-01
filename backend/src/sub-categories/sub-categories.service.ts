import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { SubCategoryTranslation } from './entities/sub-category-translation.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { Role } from '../common/enums/role.enum';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { uniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subRepo: Repository<SubCategory>,
    @InjectRepository(SubCategoryTranslation)
    private readonly trRepo: Repository<SubCategoryTranslation>,
    @InjectRepository(Category)
    private readonly catRepo: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(user: IAuthenticatedUser): Promise<SubCategory[]> {
    const qb = this.subRepo
      .createQueryBuilder('sc')
      .leftJoinAndSelect('sc.translations', 't')
      .leftJoinAndSelect('sc.category', 'c')
      .orderBy('sc.sortOrder', 'ASC');
    if (user.tenantId) {
      qb.andWhere('sc.tenantId = :tenantId', { tenantId: user.tenantId });
    }
    return qb.getMany();
  }

  async findOne(id: string, user: IAuthenticatedUser): Promise<SubCategory> {
    const sc = await this.subRepo.findOne({
      where: { id },
      relations: { translations: true, category: true },
    });
    if (!sc) throw new NotFoundException('SubCategory not found');
    if (user.tenantId && sc.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    return sc;
  }

  async create(
    dto: CreateSubCategoryDto,
    user: IAuthenticatedUser,
  ): Promise<SubCategory> {
    const tenantId =
      user.role === Role.SUPERADMIN ? dto.tenantId : user.tenantId;
    if (!tenantId) throw new BadRequestException('tenantId required');
    const cat = await this.catRepo.findOne({ where: { id: dto.categoryId } });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat.tenantId !== tenantId) {
      throw new ForbiddenException('Category does not belong to tenant');
    }
    const slug = dto.slug || uniqueSlug(dto.name);
    return this.dataSource.transaction(async (manager) => {
      const sc = manager.getRepository(SubCategory).create({
        tenantId,
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description ?? null,
        image: dto.image ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      });
      const saved = await manager.getRepository(SubCategory).save(sc);
      if (dto.translations?.length) {
        const trs = dto.translations.map((t) =>
          manager.getRepository(SubCategoryTranslation).create({
            subCategoryId: saved.id,
            locale: t.locale,
            name: t.name,
            description: t.description ?? null,
          }),
        );
        await manager.getRepository(SubCategoryTranslation).save(trs);
      }
      return manager.getRepository(SubCategory).findOneOrFail({
        where: { id: saved.id },
        relations: { translations: true, category: true },
      });
    });
  }

  async update(
    id: string,
    dto: UpdateSubCategoryDto,
    user: IAuthenticatedUser,
  ): Promise<SubCategory> {
    const sc = await this.findOne(id, user);
    return this.dataSource.transaction(async (manager) => {
      Object.assign(sc, {
        name: dto.name ?? sc.name,
        slug: dto.slug ?? sc.slug,
        description: dto.description ?? sc.description,
        image: dto.image ?? sc.image,
        sortOrder: dto.sortOrder ?? sc.sortOrder,
        isActive: dto.isActive ?? sc.isActive,
        categoryId: dto.categoryId ?? sc.categoryId,
      });
      await manager.getRepository(SubCategory).save(sc);
      if (dto.translations) {
        await manager
          .getRepository(SubCategoryTranslation)
          .delete({ subCategoryId: sc.id });
        if (dto.translations.length) {
          const trs = dto.translations.map((t) =>
            manager.getRepository(SubCategoryTranslation).create({
              subCategoryId: sc.id,
              locale: t.locale,
              name: t.name,
              description: t.description ?? null,
            }),
          );
          await manager.getRepository(SubCategoryTranslation).save(trs);
        }
      }
      return manager.getRepository(SubCategory).findOneOrFail({
        where: { id: sc.id },
        relations: { translations: true, category: true },
      });
    });
  }

  async remove(
    id: string,
    user: IAuthenticatedUser,
  ): Promise<{ success: true }> {
    const sc = await this.findOne(id, user);
    await this.subRepo.delete(sc.id);
    return { success: true };
  }
}
