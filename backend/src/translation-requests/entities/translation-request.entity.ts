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
import { User } from '../../users/entities/user.entity';
import {
  TranslationRequestEntityType,
  TranslationRequestStatus,
} from '../../common/enums/translation-request.enums';

@Entity('translation_requests')
@Index(['tenantId'])
@Index(['requestedByUserId'])
@Index(['status'])
@Index(['tenantId', 'status'])
export class TranslationRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  requestedByUserId!: string;

  @Column({ type: 'varchar', length: 10 })
  targetLocale!: string;

  @Column({ type: 'enum', enum: TranslationRequestEntityType })
  entityType!: TranslationRequestEntityType;

  @Column({ type: 'uuid', nullable: true })
  entityId!: string | null;

  @Column({
    type: 'enum',
    enum: TranslationRequestStatus,
    default: TranslationRequestStatus.PENDING,
  })
  status!: TranslationRequestStatus;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.translationRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant;

  @ManyToOne(() => User, (user) => user.translationRequests, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'requestedByUserId' })
  requestedBy?: User;
}
