import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  Index,
  Unique,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Category } from '../../categories/entities/category.entity';
import { SubCategory } from '../../sub-categories/entities/sub-category.entity';
import { ProductPrice } from './product-price.entity';
import { ProductTranslation } from './product-translation.entity';
import { ProductNutrition } from './product-nutrition.entity';

@Entity('products')
@Unique('UQ_product_tenant_slug', ['tenantId', 'slug'])
@Index(['tenantId'])
@Index(['categoryId'])
@Index(['subCategoryId'])
@Index(['tenantId', 'isActive'])
@Index(['tenantId', 'isFeatured'])
@Index(['tenantId', 'sortOrder'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @Column({ type: 'uuid', nullable: true })
  subCategoryId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 150 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  image!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @ManyToOne(() => SubCategory, (sub) => sub.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory?: SubCategory | null;

  @OneToMany(() => ProductPrice, (price) => price.product, { cascade: true })
  prices?: ProductPrice[];

  @OneToMany(() => ProductTranslation, (t) => t.product, { cascade: true })
  translations?: ProductTranslation[];

  @OneToOne(() => ProductNutrition, (n) => n.product, { cascade: true })
  nutrition?: ProductNutrition | null;
}
