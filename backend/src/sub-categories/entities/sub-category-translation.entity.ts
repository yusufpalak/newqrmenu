import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { SubCategory } from './sub-category.entity';

@Entity('sub_category_translations')
@Unique('UQ_subcategory_translation_locale', ['subCategoryId', 'locale'])
@Index(['subCategoryId'])
export class SubCategoryTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  subCategoryId!: string;

  @Column({ type: 'varchar', length: 10 })
  locale!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => SubCategory, (sub) => sub.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory?: SubCategory;
}
