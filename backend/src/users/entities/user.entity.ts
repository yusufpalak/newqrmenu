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
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { TranslationRequest } from '../../translation-requests/entities/translation-request.entity';
import { Media } from '../../media/entities/media.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['tenantId'])
@Index(['tenantId', 'role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @Column({ type: 'uuid', nullable: true })
  tenantId!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'tenantId' })
  tenant?: Tenant | null;

  @OneToMany(() => TranslationRequest, (tr) => tr.requestedBy)
  translationRequests?: TranslationRequest[];

  @OneToMany(() => Media, (media) => media.user)
  media?: Media[];
}
