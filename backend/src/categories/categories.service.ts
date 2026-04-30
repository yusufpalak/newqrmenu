import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Role } from '../common/enums/role.enum';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { uniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(CategoryTranslation)
    private readonly translationRepo: Repository<CategoryTranslation>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(user: IAuthenticatedUser): Promise<Category[]> {
    const qb = this.categoryRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.translations', 't')
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('c.createdAt', 'DESC');
    if (user.role !== Role.SUPERADMIN) {
      qb.andWhere('c.tenantId = :tenantId', { tenantId: user.tenantId });
    }
    return qb.getMany();
  }

  async findOne(id: string, user: IAuthenticatedUser): Promise<Category> {
    const c = await this.categoryRepo.findOne({
      where: { id },
      relations: { translations: true },
    });
    if (!c) throw new NotFoundException('Category not found');
    if (user.role !== Role.SUPERADMIN && c.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    return c;
  }

  async create(
    dto: CreateCategoryDto,
    user: IAuthenticatedUser,
  ): Promise<Category> {
    const tenantId =
      user.role === Role.SUPERADMIN ? dto.tenantId : user.tenantId;
    if (!tenantId) throw new BadRequestException('tenantId required');

    const slug = dto.slug || uniqueSlug(dto.name);
    return this.dataSource.transaction(async (manager) => {
      const cat = manager.getRepository(Category).create({
        tenantId,
        name: dto.name,
        slug,
        description: dto.description ?? null,
        image: dto.image ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      });
      const saved = await manager.getRepository(Category).save(cat);
      if (dto.translations?.length) {
        const trs = dto.translations.map((t) =>
          manager.getRepository(CategoryTranslation).create({
            categoryId: saved.id,
            locale: t.locale,
            name: t.name,
            description: t.description ?? null,
          }),
        );
        await manager.getRepository(CategoryTranslation).save(trs);
      }
      return manager.getRepository(Category).findOneOrFail({
        where: { id: saved.id },
        relations: { translations: true },
      });
    });
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    user: IAuthenticatedUser,
  ): Promise<Category> {
    const cat = await this.findOne(id, user);
    return this.dataSource.transaction(async (manager) => {
      Object.assign(cat, {
        name: dto.name ?? cat.name,
        slug: dto.slug ?? cat.slug,
        description: dto.description ?? cat.description,
        image: dto.image ?? cat.image,
        sortOrder: dto.sortOrder ?? cat.sortOrder,
        isActive: dto.isActive ?? cat.isActive,
      });
      await manager.getRepository(Category).save(cat);
      if (dto.translations) {
        await manager
          .getRepository(CategoryTranslation)
          .delete({ categoryId: cat.id });
        if (dto.translations.length) {
          const trs = dto.translations.map((t) =>
            manager.getRepository(CategoryTranslation).create({
              categoryId: cat.id,
              locale: t.locale,
              name: t.name,
              description: t.description ?? null,
            }),
          );
          await manager.getRepository(CategoryTranslation).save(trs);
        }
      }
      return manager.getRepository(Category).findOneOrFail({
        where: { id: cat.id },
        relations: { translations: true },
      });
    });
  }

  async remove(
    id: string,
    user: IAuthenticatedUser,
  ): Promise<{ success: true }> {
    const cat = await this.findOne(id, user);
    await this.categoryRepo.delete(cat.id);
    return { success: true };
  }
}
