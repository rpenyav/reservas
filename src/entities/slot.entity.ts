import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lawyer } from './lawyer.entity';

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lawyer)
  @JoinColumn({ name: 'lawyerId' })
  lawyer: Lawyer;

  @Column({ type: 'int' })
  lawyerId: number;

  @Column({ type: 'datetime' })
  dateStart: Date;

  @Column({ type: 'datetime' })
  dateEnd: Date;

  @Column({ type: 'boolean', default: true })
  available: boolean;
}
