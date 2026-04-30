import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { BlogTranslation } from './blog-translation.entity';

/**
 * System-wide blog post (no tenant scoping — only SUPERADMIN manages).
 * Title / body / SEO metadata live in {@link BlogTranslation} rows, one per locale.
 */
@Entity('blog_posts')
@Unique('UQ_blog_slug', ['slug'])
@Index(['isPublished', 'publishedAt'])
@Index(['sortOrder'])
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Canonical default-locale slug, used as a stable key. */
  @Column({ type: 'varchar', length: 200 })
  slug!: string;

  /** Source locale (TR/EN/...) the SUPERADMIN authored the post in. */
  @Column({ type: 'varchar', length: 10, default: 'tr' })
  sourceLocale!: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  coverImage!: string | null;

  @Column({ type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  /** Comma-separated tag list (kept simple for SEO keywords). */
  @Column({ type: 'varchar', length: 500, nullable: true })
  tags!: string | null;

  @Column({ type: 'uuid', nullable: true })
  authorId!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => BlogTranslation, (t) => t.post, { cascade: true })
  translations?: BlogTranslation[];
}
