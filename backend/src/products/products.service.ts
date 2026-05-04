import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductPrice } from './entities/product-price.entity';
import { ProductTranslation } from './entities/product-translation.entity';
import { ProductNutrition } from './entities/product-nutrition.entity';
import { Category } from '../categories/entities/category.entity';
import {
  CreateProductDto,
  ProductNutritionDto,
  ProductPriceDto,
  ProductTranslationDto,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../common/enums/role.enum';
import { IAuthenticatedUser } from '../common/interfaces/jwt-payload.interface';
import { uniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly catRepo: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Eager load all relations in single QueryBuilder query (no N+1).
   */
  findAll(user: IAuthenticatedUser): Promise<Product[]> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 't')
      .leftJoinAndSelect('p.prices', 'pr')
      .leftJoinAndSelect('pr.currency', 'cur')
      .leftJoinAndSelect('p.nutrition', 'n')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.subCategory', 'sc')
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.createdAt', 'DESC');
    if (user.tenantId) {
      qb.andWhere('p.tenantId = :tenantId', { tenantId: user.tenantId });
    }
    return qb.getMany();
  }

  async findOne(id: string, user: IAuthenticatedUser): Promise<Product> {
    const p = await this.productRepo.findOne({
      where: { id },
      relations: {
        translations: true,
        prices: { currency: true },
        nutrition: true,
        category: true,
        subCategory: true,
      },
    });
    if (!p) throw new NotFoundException('Product not found');
    if (user.tenantId && p.tenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied');
    }
    return p;
  }

  async create(
    dto: CreateProductDto,
    user: IAuthenticatedUser,
  ): Promise<Product> {
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
      const product = manager.getRepository(Product).create({
        tenantId,
        categoryId: dto.categoryId,
        subCategoryId: dto.subCategoryId ?? null,
        name: dto.name,
        slug,
        description: dto.description ?? null,
        image: dto.image ?? null,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        isPopular: dto.isPopular ?? false,
        sortOrder: dto.sortOrder ?? 0,
      });
      const saved = await manager.getRepository(Product).save(product);

      await this.savePrices(manager, saved.id, dto.prices);
      // Update tenant's pricesUpdatedAt
      if (dto.prices?.length) {
        await manager.getRepository('Tenant').update(tenantId, { pricesUpdatedAt: new Date() });
      }
      await this.saveTranslations(manager, saved.id, dto.translations);
      await this.saveNutrition(manager, saved.id, dto.nutrition);

      return manager.getRepository(Product).findOneOrFail({
        where: { id: saved.id },
        relations: {
          translations: true,
          prices: { currency: true },
          nutrition: true,
          category: true,
          subCategory: true,
        },
      });
    });
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    user: IAuthenticatedUser,
  ): Promise<Product> {
    const product = await this.findOne(id, user);
    return this.dataSource.transaction(async (manager) => {
      // Remove relations so TypeORM doesn't override FK columns with stale objects
      if (dto.categoryId !== undefined) delete product.category;
      if (dto.subCategoryId !== undefined) delete product.subCategory;

      Object.assign(product, {
        name: dto.name ?? product.name,
        slug: dto.slug ?? product.slug,
        description: dto.description ?? product.description,
        image: dto.image ?? product.image,
        isActive: dto.isActive ?? product.isActive,
        isFeatured: dto.isFeatured ?? product.isFeatured,
        isPopular: dto.isPopular ?? product.isPopular,
        sortOrder: dto.sortOrder ?? product.sortOrder,
        categoryId: dto.categoryId ?? product.categoryId,
        subCategoryId:
          dto.subCategoryId !== undefined
            ? dto.subCategoryId
            : product.subCategoryId,
      });
      await manager.getRepository(Product).save(product);

      if (dto.prices) {
        await manager
          .getRepository(ProductPrice)
          .delete({ productId: product.id });
        await this.savePrices(manager, product.id, dto.prices);
        // Update tenant's pricesUpdatedAt
        await manager.getRepository('Tenant').update(product.tenantId, { pricesUpdatedAt: new Date() });
      }
      if (dto.translations) {
        await manager
          .getRepository(ProductTranslation)
          .delete({ productId: product.id });
        await this.saveTranslations(manager, product.id, dto.translations);
      }
      if (dto.nutrition !== undefined) {
        await manager
          .getRepository(ProductNutrition)
          .delete({ productId: product.id });
        await this.saveNutrition(manager, product.id, dto.nutrition);
      }

      return manager.getRepository(Product).findOneOrFail({
        where: { id: product.id },
        relations: {
          translations: true,
          prices: { currency: true },
          nutrition: true,
          category: true,
          subCategory: true,
        },
      });
    });
  }

  async remove(
    id: string,
    user: IAuthenticatedUser,
  ): Promise<{ success: true }> {
    const p = await this.findOne(id, user);
    await this.productRepo.delete(p.id);
    return { success: true };
  }

  private async savePrices(
    manager: import('typeorm').EntityManager,
    productId: string,
    prices: ProductPriceDto[] | undefined,
  ): Promise<void> {
    if (!prices?.length) return;
    const repo = manager.getRepository(ProductPrice);
    const rows = prices.map((p) =>
      repo.create({
        productId,
        currencyId: p.currencyId,
        price: p.price.toFixed(2),
        discountedPrice:
          p.discountedPrice !== undefined ? p.discountedPrice.toFixed(2) : null,
      }),
    );
    await repo.save(rows);
  }

  private async saveTranslations(
    manager: import('typeorm').EntityManager,
    productId: string,
    translations: ProductTranslationDto[] | undefined,
  ): Promise<void> {
    if (!translations?.length) return;
    const repo = manager.getRepository(ProductTranslation);
    const rows = translations.map((t) =>
      repo.create({
        productId,
        locale: t.locale,
        name: t.name,
        description: t.description ?? null,
        ingredients: t.ingredients ?? null,
      }),
    );
    await repo.save(rows);
  }

  private async saveNutrition(
    manager: import('typeorm').EntityManager,
    productId: string,
    nutrition: ProductNutritionDto | undefined,
  ): Promise<void> {
    if (!nutrition) return;
    const repo = manager.getRepository(ProductNutrition);
    await repo.save(
      repo.create({
        productId,
        calories: nutrition.calories ?? null,
        protein: nutrition.protein ?? null,
        carbohydrate: nutrition.carbohydrate ?? null,
        fat: nutrition.fat ?? null,
        sugar: nutrition.sugar ?? null,
        salt: nutrition.salt ?? null,
        allergens: nutrition.allergens ?? null,
        ingredients: nutrition.ingredients ?? null,
      }),
    );
  }
}
