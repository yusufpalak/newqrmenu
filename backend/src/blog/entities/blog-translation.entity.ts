import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BlogPost } from './blog-post.entity';

/** One row per locale per blog post. */
@Entity('blog_post_translations')
@Unique('UQ_blog_translation_locale', ['postId', 'locale'])
@Unique('UQ_blog_translation_slug_locale', ['locale', 'slug'])
@Index(['postId'])
@Index(['locale'])
export class BlogTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  postId!: string;

  @Column({ type: 'varchar', length: 10 })
  locale!: string;

  /** Per-locale slug for SEO-friendly URLs (auto-derived from translated title). */
  @Column({ type: 'varchar', length: 220 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt!: string | null;

  /** Long-form HTML / markdown body. */
  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription!: string | null;

  @ManyToOne(() => BlogPost, (p) => p.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post?: BlogPost;
}
