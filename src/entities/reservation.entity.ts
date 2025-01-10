import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Slot } from './slot.entity';
import { User } from './user.entity';
import { Lawyer } from './lawyer.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Slot)
  @JoinColumn({ name: 'slotId' })
  slot: Slot;

  @Column({ type: 'int' })
  slotId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => Lawyer)
  @JoinColumn({ name: 'lawyerId' })
  lawyer: Lawyer;

  @Column({ type: 'varchar', length: 20, unique: true })
  trackingCode: string; // Nuevo campo para el código de seguimiento

  @Column({ type: 'int' })
  lawyerId: number;

  @CreateDateColumn()
  creationDate: Date;

  @Column({ type: 'enum', enum: ['pendiente', 'confirmada', 'cancelada'] })
  status: 'pendiente' | 'confirmada' | 'cancelada';
}
