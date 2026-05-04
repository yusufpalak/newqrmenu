import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
  @PrimaryColumn({ type: 'int', default: 1 })
  id!: number;

  @Column({ type: 'varchar', length: 255, default: 'support@qrmenu.com' })
  contactEmail!: string;

  @Column({ type: 'varchar', length: 64, default: '+90 (555) 555 55 55' })
  contactPhone!: string;

  @Column({ type: 'varchar', length: 255, default: 'Istanbul, Türkiye' })
  contactAddress!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
