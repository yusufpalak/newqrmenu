import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { SubCategory } from '../../sub-categories/entities/sub-category.entity';
import { Product } from '../../products/entities/product.entity';
import { CategoryTranslation } from './category-translation.entity';

@Entity('categories')
@Unique('UQ_category_tenant_slug', ['tenantId', 'slug'])
@Index(['tenantId'])
@Index(['tenantId', 'isActive'])
@Index(['tenantId', 'sortOrder'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 150 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  image!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @OneToMany(() => SubCategory, (sub) => sub.category)
  subCategories?: SubCategory[];

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  @OneToMany(() => CategoryTranslation, (t) => t.category, { cascade: true })
  translations?: CategoryTranslation[];
}
