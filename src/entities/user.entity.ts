import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  secondName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  documentNumber: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: ['cliente', 'admin'] })
  role: 'cliente' | 'admin';

  @CreateDateColumn()
  creationDate: Date;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'int', nullable: true })
  idLawyer: number | null; // Si el usuario es abogado.
}
