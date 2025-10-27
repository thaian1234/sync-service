import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cms_orders')
export class CmsOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'core_order_id', unique: true })
  coreOrderId: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column()
  status: string;

  @Column({ name: 'synced_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  syncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
