import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // Importa JwtModule
import { Interaction } from '../entities/interaction.entity';
import { Slot } from '../entities/slot.entity';
import { Lawyer } from '../entities/lawyer.entity';
import { Reservation } from '../entities/reservation.entity';
import { Conversation } from '../entities/conversation.entity';
import { OpenAIController } from './openAI.controller';
import { OpenAIService } from './openAI.service';

import { ReservasGuard } from '../guards/reservas.guard'; // Importa el guard
import { SlotService } from 'src/slot/slot.service';
import { InteractionService } from './interaction/interaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Interaction,
      Slot,
      Lawyer,
      Reservation,
      Conversation,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Configura la clave secreta
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [OpenAIController],
  providers: [OpenAIService, SlotService, InteractionService, ReservasGuard], // Registra el guard
  exports: [OpenAIService],
})
export class OpenAIModule {}
