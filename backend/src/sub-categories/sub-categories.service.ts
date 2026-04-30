import {  Injectable, NotFoundException, ForbiddenException  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';

@Injectable()export class SubCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId, userRole) {
    const where = userRole === 'SUPERADMIN' ? {} : { tenantId };

    return this.prisma.subCategory.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        translations: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id, tenantId, userRole) {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: true,
        translations: true,
      },
    });

    if (!subCategory) {
      throw new NotFoundException('SubCategory not found');
    }

    if (userRole !== 'SUPERADMIN' && subCategory.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return subCategory;
  }

  async create(createSubCategoryDto, tenantId, userRole?) {
    const { translations, ...data } = createSubCategoryDto;

    return this.prisma.$transaction(async (prisma) => {
      // Verify category belongs to tenant
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || (userRole !== 'SUPERADMIN' && category.tenantId !== tenantId)) {
        throw new ForbiddenException('Category not found or access denied');
      }

      const subCategory = await prisma.subCategory.create({
        data: {
          ...data,
          tenantId,
        },
      });

      if (translations && translations.length > 0) {
        await prisma.subCategoryTranslation.createMany({
          data: translations.map(t => ({
            subCategoryId: subCategory.id,
            ...t,
          })),
        });
      }

      return prisma.subCategory.findUnique({
        where: { id: subCategory.id },
        include: { translations: true, category: true },
      });
    });
  }

  async update(id, updateSubCategoryDto, tenantId, userRole) {
    await this.findOne(id, tenantId, userRole);

    const { translations, ...data } = updateSubCategoryDto;

    return this.prisma.$transaction(async (prisma) => {
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!category || (userRole !== 'SUPERADMIN' && category.tenantId !== tenantId)) {
          throw new ForbiddenException('Category not found or access denied');
        }
      }

      const subCategory = await prisma.subCategory.update({
        where: { id },
        data,
      });

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await prisma.subCategoryTranslation.upsert({
            where: {
              subCategoryId_locale: {
                subCategoryId: id,
                locale: t.locale,
              },
            },
            update: t,
            create: {
              subCategoryId: id,
              ...t,
            },
          });
        }
      }

      return prisma.subCategory.findUnique({
        where: { id },
        include: { translations: true, category: true },
      });
    });
  }

  async remove(id, tenantId, userRole) {
    await this.findOne(id, tenantId, userRole);

    return this.prisma.subCategory.delete({
      where: { id },
    });
  }
}
