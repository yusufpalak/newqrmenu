import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_nutrition')
@Index(['productId'], { unique: true })
export class ProductNutrition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  productId!: string;

  @Column({ type: 'float', nullable: true })
  calories!: number | null;

  @Column({ type: 'float', nullable: true })
  protein!: number | null;

  @Column({ type: 'float', nullable: true })
  carbohydrate!: number | null;

  @Column({ type: 'float', nullable: true })
  fat!: number | null;

  @Column({ type: 'float', nullable: true })
  sugar!: number | null;

  @Column({ type: 'float', nullable: true })
  salt!: number | null;

  @Column({ type: 'text', nullable: true })
  allergens!: string | null;

  @Column({ type: 'text', nullable: true })
  ingredients!: string | null;

  @OneToOne(() => Product, (product) => product.nutrition, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;
}
