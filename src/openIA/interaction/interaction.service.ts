import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { Conversation } from 'src/entities/conversation.entity';
import { Interaction } from 'src/entities/interaction.entity';

@Injectable()
export class InteractionService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  // Crear interacción
  async create(
    createInteractionDto: CreateInteractionDto,
  ): Promise<Interaction> {
    const { conversationId } = createInteractionDto;

    // Verificar si la conversación existe
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new BadRequestException(
        `La conversación con ID ${conversationId} no existe.`,
      );
    }

    const interaction = this.interactionRepository.create(createInteractionDto);
    return await this.interactionRepository.save(interaction);
  }

  // Obtener todas las interacciones con paginación
  async findAll(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<{
    pageSize: number;
    pageNumber: number;
    totalRegisters: number;
    list: Interaction[];
  }> {
    const skip = (pageNumber - 1) * pageSize;
    const totalRegisters = await this.interactionRepository.count();

    const list = await this.interactionRepository.find({
      skip,
      take: pageSize,
      relations: ['conversation'],
    });

    return {
      pageSize,
      pageNumber,
      totalRegisters,
      list,
    };
  }

  // Obtener interacción por ID
  async findOne(id: number): Promise<Interaction> {
    const interaction = await this.interactionRepository.findOne({
      where: { id },
      relations: ['conversation'],
    });
    if (!interaction) {
      throw new NotFoundException(`Interacción con ID ${id} no encontrada.`);
    }
    return interaction;
  }

  // Actualizar interacción
  async update(
    id: number,
    updateInteractionDto: UpdateInteractionDto,
  ): Promise<Interaction> {
    const interaction = await this.findOne(id);

    const updatedInteraction = this.interactionRepository.merge(
      interaction,
      updateInteractionDto,
    );
    return await this.interactionRepository.save(updatedInteraction);
  }

  // Eliminar interacción
  async remove(id: number): Promise<void> {
    const interaction = await this.findOne(id);
    await this.interactionRepository.remove(interaction);
  }
}
