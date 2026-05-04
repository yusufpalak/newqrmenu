import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('banners')
@Index(['tenantId', 'isActive'])
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  subtitle!: string | null;

  @Column({ type: 'varchar', length: 7, default: '#F59E0B' })
  bgColor!: string;

  @Column({ type: 'varchar', length: 7, default: '#1C1917' })
  textColor!: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  startsAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;
}
