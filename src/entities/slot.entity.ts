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

  @ManyToOne(() => Lawyer, { nullable: false }) // Relación con la tabla de abogados
  @JoinColumn({ name: 'lawyerId' })
  lawyer: Lawyer;

  @Column({ type: 'int' })
  lawyerId: number; // Clave foránea

  @Column({ type: 'datetime' })
  dateStart: Date;

  @Column({ type: 'datetime' })
  dateEnd: Date;

  @Column({ type: 'boolean', default: true })
  available: boolean;
}
