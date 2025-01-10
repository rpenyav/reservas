import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Entidades
import { User } from './entities/user.entity';
import { Lawyer } from './entities/lawyer.entity';
import { Slot } from './entities/slot.entity';
import { Reservation } from './entities/reservation.entity';
import { Conversation } from './entities/conversation.entity';
import { Interaction } from './entities/interaction.entity';

// Controladores y Servicios
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { LawyerController } from './lawyer/lawyer.controller';
import { LawyerService } from './lawyer/lawyer.service';
import { SlotController } from './slot/slot.controller';
import { SlotService } from './slot/slot.service';
import { ReservationController } from './reservation/reservation.controller';
import { ReservationService } from './reservation/reservation.service';
import { ConversationService } from './openIA/conversation/conversation.service';
import { ConversationController } from './openIA/conversation/conversation.controller';
import { InteractionController } from './openIA/interaction/interaction.controller';
import { InteractionService } from './openIA/interaction/interaction.service';

import { OpenAIModule } from './openIA/openAI.module';

@Module({
  imports: [
    OpenAIModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'reservas',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),

    TypeOrmModule.forFeature([
      User,
      Lawyer,
      Slot,
      Reservation,
      Conversation,
      Interaction,
    ]),
  ],
  controllers: [
    UserController,
    LawyerController,
    SlotController,
    ReservationController,
    ConversationController,
    InteractionController,
  ],
  providers: [
    UserService,
    LawyerService,
    SlotService,
    ReservationService,
    ConversationService,
    InteractionService,
  ],
})
export class AppModule {}
