import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('interactions')
export class Interaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ type: 'int' })
  conversationId: number;

  @Column({ type: 'text' })
  humanMessage: string;

  @Column({ type: 'text', nullable: true })
  botMessage: string;

  @CreateDateColumn()
  date: Date;
}
