import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Category } from '../categories/entities/category.entity';
import { Currency } from '../currencies/entities/currency.entity';
import { ProductPrice } from '../products/entities/product-price.entity';

export interface IPublicMenuQuery {
  locale?: string;
  currency?: string;
}

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async getTenantBySlug(slug: string): Promise<Tenant> {
    const t = await this.tenantRepo.findOne({
      where: { slug, isActive: true },
      relations: { defaultCurrency: true },
    });
    if (!t) throw new NotFoundException('Restaurant not found');

    // Subscription check — block if no subscription OR expired
    const exp = t.subscriptionExpiresAt;
    if (!exp || new Date() > new Date(exp)) {
      throw new ForbiddenException('SUBSCRIPTION_EXPIRED');
    }

    return t;
  }

  /**
   * Loads full menu in a SINGLE query (no N+1).
   * Transforms products with a single price for the selected currency
   * and distributes subcategory products correctly.
   */
  async getMenu(slug: string, query: IPublicMenuQuery) {
    const tenant = await this.getTenantBySlug(slug);
    const locale = query.locale || tenant.defaultLocale;

    // All active currencies for the switcher
    const allCurrencies = await this.currencyRepo.find({
      where: { isActive: true },
      order: { code: 'ASC' },
    });

    // Determine selected currency
    let currency: Currency | null = null;
    if (query.currency) {
      currency = allCurrencies.find((c) => c.code === query.currency) ?? null;
    }
    if (!currency) {
      currency = tenant.defaultCurrency ?? allCurrencies[0] ?? null;
    }

    // Single query — no N+1
    const categories = await this.categoryRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.translations', 'ct', 'ct.locale = :locale', { locale })
      .leftJoinAndSelect('c.subCategories', 'sc', 'sc.isActive = :active', { active: true })
      .leftJoinAndSelect('sc.translations', 'sct', 'sct.locale = :locale', { locale })
      .leftJoinAndSelect('c.products', 'p', 'p.isActive = :active', { active: true })
      .leftJoinAndSelect('p.translations', 'pt', 'pt.locale = :locale', { locale })
      .leftJoinAndSelect('p.prices', 'pr')
      .leftJoinAndSelect('pr.currency', 'cur')
      .leftJoinAndSelect('p.nutrition', 'n')
      .where('c.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('c.isActive = :active', { active: true })
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('sc.sortOrder', 'ASC')
      .addOrderBy('p.sortOrder', 'ASC')
      .getMany();

    // Helper: map a raw product entity → public product (single price)
    const transformProduct = (p: any) => {
      const translation = p.translations?.[0];
      const priceEntry: ProductPrice | undefined = currency
        ? ((p.prices ?? []).find((pr: ProductPrice) => pr.currency?.id === currency!.id) ?? (p.prices ?? [])[0])
        : (p.prices ?? [])[0];

      return {
        id: p.id as string,
        tenantId: p.tenantId as string,
        categoryId: p.categoryId as string,
        subCategoryId: p.subCategoryId as string | null,
        name: (translation?.name as string | undefined) || (p.name as string),
        slug: p.slug as string,
        description: (translation?.description as string | undefined) || (p.description as string | null),
        image: p.image as string | null,
        isActive: p.isActive as boolean,
        isFeatured: p.isFeatured as boolean,
        sortOrder: p.sortOrder as number,
        nutrition: p.nutrition ?? null,
        price: priceEntry
          ? {
              amount: priceEntry.price,
              discountedPrice: priceEntry.discountedPrice ?? null,
              currency: priceEntry.currency,
            }
          : undefined,
      };
    };

    // Transform categories: resolve locale names, distribute subcategory products
    const transformedCategories = categories.map((cat) => {
      const allProducts: any[] = cat.products ?? [];

      // Group products by subCategoryId
      const subMap = new Map<string, ReturnType<typeof transformProduct>[]>();
      const standalone: ReturnType<typeof transformProduct>[] = [];

      for (const p of allProducts) {
        const tp = transformProduct(p);
        if (p.subCategoryId) {
          const arr = subMap.get(p.subCategoryId as string) ?? [];
          arr.push(tp);
          subMap.set(p.subCategoryId as string, arr);
        } else {
          standalone.push(tp);
        }
      }

      const subCategories = (cat.subCategories ?? [])
        .map((sub) => ({
          id: sub.id,
          name: (sub.translations as any)?.[0]?.name || sub.name,
          slug: sub.slug,
          sortOrder: sub.sortOrder,
          products: subMap.get(sub.id) ?? [],
        }))
        .filter((sub) => sub.products.length > 0);

      return {
        id: cat.id,
        name: cat.translations?.[0]?.name || cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        subCategories,
        products: standalone,
      };
    });

    return {
      tenant,
      locale,
      currency,
      categories: transformedCategories,
      availableLocales: ['tr', 'en'],
      availableCurrencies: allCurrencies,
    };
  }
}
