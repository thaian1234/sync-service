import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { DlqStatus } from '../../kafka/enums';

@Entity('dlq_events')
export class DlqEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id', length: 100, nullable: true })
  eventId: string;

  @Column({ name: 'table_name', length: 50 })
  tableName: string;

  @Column({ length: 20 })
  operation: string;

  @Column({ type: 'json' })
  payload: any;

  @Column({ name: 'error_message', type: 'text' })
  errorMessage: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', default: 5 })
  maxRetries: number;

  @Column({ type: 'enum', enum: DlqStatus, default: DlqStatus.PENDING })
  status: DlqStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'last_retry_at', type: 'timestamp', nullable: true })
  lastRetryAt: Date;
}
