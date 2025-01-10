import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('lawyers')
export class Lawyer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  secondName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: true, default: '' })
  phone: string; // Permitir nulos y establecer un valor por defecto

  @Column({ type: 'varchar', length: 100, nullable: true })
  speciality: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creationDate: Date;
}
