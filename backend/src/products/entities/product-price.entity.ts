import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { Currency } from '../../currencies/entities/currency.entity';

@Entity('product_prices')
@Unique('UQ_product_price_currency', ['productId', 'currencyId'])
@Index(['productId'])
@Index(['currencyId'])
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'uuid' })
  currencyId!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  discountedPrice!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Product, (product) => product.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ManyToOne(() => Currency, (currency) => currency.productPrices, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'currencyId' })
  currency?: Currency;
}
