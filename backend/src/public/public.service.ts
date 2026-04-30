import {  Injectable, NotFoundException  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';

@Injectable()export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getMenu(tenantSlug, locale, currencyCode) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug, isActive: true },
      include: {
        defaultCurrency: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Restaurant not found');
    }

    const targetLocale = locale || tenant.defaultLocale;
    const targetCurrency = currencyCode || tenant.defaultCurrency?.code;

    const categories = await this.prisma.category.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true,
      },
      include: {
        translations: true,
        subCategories: {
          where: { isActive: true },
          include: {
            translations: true,
            products: {
              where: { isActive: true },
              include: {
                translations: true,
                prices: {
                  include: { currency: true },
                },
                nutrition: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        products: {
          where: {
            isActive: true,
            subCategoryId: null,
          },
          include: {
            translations: true,
            prices: {
              include: { currency: true },
            },
            nutrition: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const formattedCategories = categories.map(cat => {
      const translation = cat.translations.find(t => t.locale === targetLocale);
      
      return {
        id: cat.id,
        name: translation?.name || cat.name,
        description: translation?.description || cat.description,
        slug: cat.slug,
        image: cat.image,
        subCategories: cat.subCategories.map(sub => {
          const subTranslation = sub.translations.find(t => t.locale === targetLocale);
          
          return {
            id: sub.id,
            name: subTranslation?.name || sub.name,
            description: subTranslation?.description || sub.description,
            slug: sub.slug,
            image: sub.image,
            products: sub.products.map(prod => this.formatProduct(prod, targetLocale, targetCurrency)),
          };
        }),
        products: cat.products.map(prod => this.formatProduct(prod, targetLocale, targetCurrency)),
      };
    });

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        description: tenant.description,
        defaultLocale: tenant.defaultLocale,
        defaultCurrency: tenant.defaultCurrency,
      },
      categories: formattedCategories,
      availableLocales: ['tr', 'en', 'de', 'ar'],
      availableCurrencies: await this.prisma.currency.findMany({
        where: { isActive: true },
      }),
    };
  }

  formatProduct(product, locale, currencyCode) {
    const translation = product.translations.find(t => t.locale === locale);
    const price = product.prices.find(p => p.currency.code === currencyCode);

    return {
      id: product.id,
      name: translation?.name || product.name,
      description: translation?.description || product.description,
      slug: product.slug,
      image: product.image,
      isFeatured: product.isFeatured,
      price: price ? {
        amount: price.price,
        discountedPrice: price.discountedPrice,
        currency: price.currency,
      } : null,
      nutrition: product.nutrition,
    };
  }
}
