import {  Injectable, NotFoundException, ForbiddenException  } from '@nestjs/common';
import {  PrismaService  } from '../database/prisma.service';

@Injectable()export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId, userRole) {
    const where = userRole === 'SUPERADMIN' ? {} : { tenantId };

    return this.prisma.category.findMany({
      where,
      include: {
        translations: true,
        _count: {
          select: {
            subCategories: true,
            products: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id, tenantId, userRole) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (userRole !== 'SUPERADMIN' && category.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return category;
  }

  async create(createCategoryDto, tenantId) {
    const { translations, ...categoryData } = createCategoryDto;

    return this.prisma.$transaction(async (prisma) => {
      const category = await prisma.category.create({
        data: {
          ...categoryData,
          tenantId,
        },
      });

      if (translations && translations.length > 0) {
        await prisma.categoryTranslation.createMany({
          data: translations.map(t => ({
            categoryId: category.id,
            ...t,
          })),
        });
      }

      return prisma.category.findUnique({
        where: { id: category.id },
        include: { translations: true },
      });
    });
  }

  async update(id, updateCategoryDto, tenantId, userRole) {
    await this.findOne(id, tenantId, userRole);

    const { translations, ...categoryData } = updateCategoryDto;

    return this.prisma.$transaction(async (prisma) => {
      const category = await prisma.category.update({
        where: { id },
        data: categoryData,
      });

      if (translations && translations.length > 0) {
        for (const t of translations) {
          await prisma.categoryTranslation.upsert({
            where: {
              categoryId_locale: {
                categoryId: id,
                locale: t.locale,
              },
            },
            update: t,
            create: {
              categoryId: id,
              ...t,
            },
          });
        }
      }

      return prisma.category.findUnique({
        where: { id },
        include: { translations: true },
      });
    });
  }

  async remove(id, tenantId, userRole) {
    await this.findOne(id, tenantId, userRole);

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
