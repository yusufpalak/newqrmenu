import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogTranslation } from './entities/blog-translation.entity';
import { CreateBlogPostDto, BlogTranslationDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { slugify, uniqueSlug } from '../common/utils/slug.util';
import {
  TranslateService,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from '../translate/translate.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly postRepo: Repository<BlogPost>,
    @InjectRepository(BlogTranslation)
    private readonly trRepo: Repository<BlogTranslation>,
    private readonly dataSource: DataSource,
    private readonly translate: TranslateService,
  ) {}

  // ---------- Admin ----------

  async findAllAdmin(): Promise<BlogPost[]> {
    return this.postRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 't')
      .orderBy('p.sortOrder', 'ASC')
      .addOrderBy('p.createdAt', 'DESC')
      .getMany();
  }

  async findOneAdmin(id: string): Promise<BlogPost> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: { translations: true },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(dto: CreateBlogPostDto, authorId: string): Promise<BlogPost> {
    const sourceLocale = this.translate.assertSupported(dto.sourceLocale);
    const sourceTr = dto.translations.find((t) => t.locale === sourceLocale);
    if (!sourceTr) {
      throw new BadRequestException(
        'translations must include the sourceLocale entry',
      );
    }
    const baseSlug = dto.slug || slugify(sourceTr.title) || uniqueSlug('post');

    const builtTranslations = await this.buildTranslations(
      dto.translations,
      sourceLocale,
      !!dto.autoTranslate,
      baseSlug,
    );

    return this.dataSource.transaction(async (manager) => {
      const post = manager.getRepository(BlogPost).create({
        slug: baseSlug,
        sourceLocale,
        coverImage: dto.coverImage ?? null,
        isPublished: dto.isPublished ?? false,
        publishedAt: dto.isPublished ? new Date() : null,
        sortOrder: dto.sortOrder ?? 0,
        tags: dto.tags ?? null,
        authorId,
      });
      const saved = await manager.getRepository(BlogPost).save(post);
      const trs = builtTranslations.map((t) =>
        manager.getRepository(BlogTranslation).create({ ...t, postId: saved.id }),
      );
      await manager.getRepository(BlogTranslation).save(trs);
      return manager.getRepository(BlogPost).findOneOrFail({
        where: { id: saved.id },
        relations: { translations: true },
      });
    });
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const existing = await this.findOneAdmin(id);
    const sourceLocale = this.translate.assertSupported(
      dto.sourceLocale ?? existing.sourceLocale,
    );

    return this.dataSource.transaction(async (manager) => {
      Object.assign(existing, {
        slug: dto.slug ?? existing.slug,
        sourceLocale,
        coverImage: dto.coverImage ?? existing.coverImage,
        tags: dto.tags ?? existing.tags,
        sortOrder: dto.sortOrder ?? existing.sortOrder,
      });
      if (dto.isPublished !== undefined) {
        existing.isPublished = dto.isPublished;
        if (dto.isPublished && !existing.publishedAt) {
          existing.publishedAt = new Date();
        }
      }
      await manager.getRepository(BlogPost).save(existing);

      if (dto.translations) {
        const sourceTr = dto.translations.find((t) => t.locale === sourceLocale);
        if (!sourceTr) {
          throw new BadRequestException(
            'translations must include the sourceLocale entry',
          );
        }
        const built = await this.buildTranslations(
          dto.translations,
          sourceLocale,
          !!dto.autoTranslate,
          existing.slug,
        );
        await manager
          .getRepository(BlogTranslation)
          .delete({ postId: existing.id });
        const trs = built.map((t) =>
          manager
            .getRepository(BlogTranslation)
            .create({ ...t, postId: existing.id }),
        );
        await manager.getRepository(BlogTranslation).save(trs);
      }

      return manager.getRepository(BlogPost).findOneOrFail({
        where: { id: existing.id },
        relations: { translations: true },
      });
    });
  }

  async remove(id: string): Promise<{ success: true }> {
    const existing = await this.findOneAdmin(id);
    await this.postRepo.delete(existing.id);
    return { success: true };
  }

  // ---------- Public ----------

  async findPublishedList(locale: string): Promise<BlogPost[]> {
    const safeLocale = this.translate.assertSupported(locale);
    return this.postRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.translations', 't', 't.locale = :locale', {
        locale: safeLocale,
      })
      .where('p.isPublished = true')
      .orderBy('p.publishedAt', 'DESC')
      .addOrderBy('p.sortOrder', 'ASC')
      .getMany();
  }

  async findPublishedBySlug(slug: string, locale: string): Promise<BlogPost> {
    this.translate.assertSupported(locale);
    // Resolve postId by matching either the canonical slug or any translation slug.
    const matchTr = await this.trRepo.findOne({ where: { slug } });
    const postId = matchTr?.postId;
    let post: BlogPost | null = null;
    if (postId) {
      post = await this.postRepo.findOne({
        where: { id: postId, isPublished: true },
        relations: { translations: true },
      });
    } else {
      post = await this.postRepo.findOne({
        where: { slug, isPublished: true },
        relations: { translations: true },
      });
    }
    if (!post) throw new NotFoundException('Blog post not found');
    // increment view count (fire-and-forget)
    this.postRepo
      .increment({ id: post.id }, 'viewCount', 1)
      .catch(() => undefined);
    return post;
  }

  // ---------- Translation helpers ----------

  /**
   * Normalises the translations array: ensures unique slugs per locale,
   * and (optionally) auto-fills missing locales by translating from source.
   */
  private async buildTranslations(
    input: BlogTranslationDto[],
    sourceLocale: SupportedLocale,
    autoTranslate: boolean,
    canonicalSlug: string,
  ): Promise<BlogTranslationDto[]> {
    const byLocale = new Map<string, BlogTranslationDto>();
    for (const t of input) byLocale.set(t.locale, t);

    const sourceTr = byLocale.get(sourceLocale)!;

    if (autoTranslate) {
      for (const target of SUPPORTED_LOCALES) {
        if (byLocale.has(target)) continue;
        const fields = await this.translate.translateFields(
          {
            title: sourceTr.title,
            excerpt: sourceTr.excerpt ?? null,
            content: sourceTr.content,
            metaTitle: sourceTr.metaTitle ?? null,
            metaDescription: sourceTr.metaDescription ?? null,
          },
          sourceLocale,
          target,
        );
        byLocale.set(target, {
          locale: target,
          title: fields.title ?? sourceTr.title,
          excerpt: fields.excerpt,
          content: fields.content ?? sourceTr.content,
          metaTitle: fields.metaTitle,
          metaDescription: fields.metaDescription,
        });
      }
    }

    return Array.from(byLocale.values()).map((t) => ({
      ...t,
      slug:
        t.slug ||
        (t.locale === sourceLocale
          ? canonicalSlug
          : `${slugify(t.title) || canonicalSlug}-${t.locale}`),
    }));
  }
}
