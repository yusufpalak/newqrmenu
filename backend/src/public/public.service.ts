import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Category } from '../categories/entities/category.entity';
import { Currency } from '../currencies/entities/currency.entity';
import { Product } from '../products/entities/product.entity';
import { ProductPrice } from '../products/entities/product-price.entity';
import { QrScan } from './entities/qr-scan.entity';
import { Banner } from './entities/banner.entity';

export interface IPublicMenuQuery {
  locale?: string;
  currency?: string;
}

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Currency) private readonly currencyRepo: Repository<Currency>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(QrScan) private readonly qrScanRepo: Repository<QrScan>,
    @InjectRepository(Banner) private readonly bannerRepo: Repository<Banner>,
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
  async getMenu(slug: string, query: IPublicMenuQuery, req?: Request) {
    const tenant = await this.getTenantBySlug(slug);
    // Record QR scan asynchronously (fire-and-forget)
    this.qrScanRepo.save(this.qrScanRepo.create({
      tenantId: tenant.id,
      userAgent: req?.headers?.['user-agent']?.slice(0, 512) ?? null,
      ip: (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0].trim() ?? req?.ip ?? null,
    })).catch(() => {/* silent */});
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
        viewCount: p.viewCount as number ?? 0,
        isPopular: p.isPopular as boolean ?? false,
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
      banner: await this.getActiveBanner(tenant.id),
      popularProducts: transformedCategories
        .flatMap(c => [...c.products, ...c.subCategories.flatMap((s: any) => s.products)])
        .filter((p: any) => p.isPopular === true)
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      showPriceUpdateDate: tenant.showPriceUpdateDate,
      pricesUpdatedAt: tenant.pricesUpdatedAt,
    };
  }

  // ── Record product view ──────────────────────────────────────────────────────
  async recordProductView(productId: string): Promise<void> {
    await this.productRepo.increment({ id: productId }, 'viewCount', 1);
  }

  // ── Active banner for tenant ─────────────────────────────────────────────────
  async getActiveBanner(tenantId: string): Promise<Banner | null> {
    const now = new Date();
    const banners = await this.bannerRepo.find({
      where: { tenantId, isActive: true },
      order: { createdAt: 'DESC' },
    });
    return banners.find(b =>
      (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now),
    ) ?? null;
  }

  // ── All banners for admin ────────────────────────────────────────────────────
  async getBanners(tenantId: string): Promise<Banner[]> {
    return this.bannerRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  // ── QR Scan Analytics ────────────────────────────────────────────────────────
  async getAnalytics(tenantId: string) {
    const scans = await this.qrScanRepo
      .createQueryBuilder('s')
      .select("DATE_TRUNC('day', s.scannedAt)", 'day')
      .addSelect('COUNT(*)', 'count')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere("s.scannedAt >= NOW() - INTERVAL '30 days'")
      .groupBy("DATE_TRUNC('day', s.scannedAt)")
      .orderBy('day', 'ASC')
      .getRawMany();

    const total = await this.qrScanRepo.count({ where: { tenantId } });
    const today = await this.qrScanRepo
      .createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere("s.scannedAt >= DATE_TRUNC('day', NOW())")
      .getCount();

    const topProducts = await this.productRepo.find({
      where: { tenantId, isActive: true },
      order: { viewCount: 'DESC' },
      take: 10,
      select: ['id', 'name', 'viewCount', 'image'],
    });

    return { daily: scans, total, today, topProducts };
  }
}
