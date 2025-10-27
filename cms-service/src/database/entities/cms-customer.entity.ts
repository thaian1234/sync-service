import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cms_customers')
export class CmsCustomer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'core_customer_id', unique: true })
  coreCustomerId: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'synced_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  syncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
