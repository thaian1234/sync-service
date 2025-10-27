import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('processed_events')
export class ProcessedEvent {
  @PrimaryColumn({ name: 'event_id', length: 100 })
  eventId: string;

  @Column({ name: 'table_name', length: 50 })
  tableName: string;

  @Column({ name: 'record_id' })
  recordId: number;

  @Column({ length: 20 })
  operation: string;

  @CreateDateColumn({ name: 'processed_at' })
  processedAt: Date;
}
