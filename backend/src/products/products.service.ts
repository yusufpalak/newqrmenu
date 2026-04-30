import {  Injectable, NotFoundException, ForbiddenException  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';

@Injectable()export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId, userRole) {
    const where = userRole === 'SUPERADMIN' ? {} : { tenantId };

    return this.prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        prices: { include: { currency: true } },
        nutrition: true,
        translations: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id, tenantId, userRole) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        prices: { include: { currency: true } },
        nutrition: true,
        translations: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userRole !== 'SUPERADMIN' && product.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return product;
  }

  async create(createProductDto, tenantId) {
    const { prices, nutrition, translations, ...productData } = createProductDto;

    // Auto-generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();
    }

    return this.prisma.$transaction(async (prisma) => {
      const category = await prisma.category.findUnique({
        where: { id: productData.categoryId },
      });

      if (!category || category.tenantId !== tenantId) {
        throw new ForbiddenException('Category not found or access denied');
      }

      if (productData.subCategoryId) {
        const subCategory = await prisma.subCategory.findUnique({
          where: { id: productData.subCategoryId },
        });

        if (!subCategory || subCategory.tenantId !== tenantId) {
          throw new ForbiddenException('SubCategory not found or access denied');
        }
      }

      const product = await prisma.product.create({
        data: {
          ...productData,
          tenantId,
        },
      });

      if (prices && prices.length > 0) {
        await prisma.productPrice.createMany({
          data: prices.map(p => ({
            productId: product.id,
            ...p,
          })),
        });
      }

      if (nutrition) {
        await prisma.productNutrition.create({
          data: {
            productId: product.id,
            ...nutrition,
          },
        });
      }

      if (translations && translations.length > 0) {
        await prisma.productTranslation.createMany({
          data: translations.map(t => ({
            productId: product.id,
            ...t,
          })),
        });
      }

      return prisma.product.findUnique({
        where: { id: product.id },
        include: {
          prices: { include: { currency: true } },
          nutrition: true,
          translations: true,
        },
      });
    });
  }

  async update(id, updateProductDto, tenantId, userRole) {
    await this.findOne(id, tenantId, userRole);

    const { prices, nutrition, translations, ...productData } = updateProductDto;

    return this.prisma.$transaction(async (prisma) => {
      const product = await prisma.product.update({
        where: { id },
        data: productData,
      });

      if (prices && prices.length > 0) {
        for (const p of prices) {
          await prisma.productPrice.upsert({
            where: {
              productId_currencyId: {
                productId: id,
                currencyId: p.currencyId,
              },
            },
            update: p,
            create: {
              productId: id,
              ...p,
            },
          });
        }
      }

      if (nutrition) {
        await prisma.productNutrition.upsert({
          where: { productId: id },
          update: nutrition,
          create: {
            productId: id,
            ...nutrition,
          },
        });
      }

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await prisma.productTranslation.upsert({
            where: {
              productId_locale: {
                productId: id,
                locale: t.locale,
              },
            },
            update: t,
            create: {
              productId: id,
              ...t,
            },
          });
        }
      }

      return prisma.product.findUnique({
        where: { id },
        include: {
          prices: { include: { currency: true } },
          nutrition: true,
          translations: true,
        },
      });
    });
  }

  async remove(id, tenantId, userRole) {
    await this.findOne(id, tenantId, userRole);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
