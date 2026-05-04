import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Currency } from '../../currencies/entities/currency.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { SubCategory } from '../../sub-categories/entities/sub-category.entity';
import { Product } from '../../products/entities/product.entity';
import { TranslationRequest } from '../../translation-requests/entities/translation-request.entity';
import { Media } from '../../media/entities/media.entity';

@Entity('tenants')
@Index(['slug'], { unique: true })
@Index(['isActive'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  logo!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 10, default: 'tr' })
  defaultLocale!: string;

  @Column({ type: 'uuid', nullable: true })
  defaultCurrencyId!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subscriptionPlan!: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | null;

  @Column({ type: 'timestamptz', nullable: true })
  subscriptionExpiresAt!: Date | null;

  @Column({ type: 'boolean', default: true })
  showPriceUpdateDate!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  pricesUpdatedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Currency, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'defaultCurrencyId' })
  defaultCurrency?: Currency | null;

  @OneToMany(() => User, (user) => user.tenant)
  users?: User[];

  @OneToMany(() => Category, (category) => category.tenant)
  categories?: Category[];

  @OneToMany(() => SubCategory, (subCategory) => subCategory.tenant)
  subCategories?: SubCategory[];

  @OneToMany(() => Product, (product) => product.tenant)
  products?: Product[];

  @OneToMany(() => Media, (media) => media.tenant)
  media?: Media[];

  @OneToMany(() => TranslationRequest, (tr) => tr.tenant)
  translationRequests?: TranslationRequest[];
}
