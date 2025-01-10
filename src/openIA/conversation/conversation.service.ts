import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { User } from 'src/entities/user.entity';
import { Conversation } from 'src/entities/conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Crear conversación
  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { userId } = createConversationDto;

    // Verificar si el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`El usuario con ID ${userId} no existe.`);
    }

    const conversation = this.conversationRepository.create(
      createConversationDto,
    );
    return await this.conversationRepository.save(conversation);
  }

  // Obtener todas las conversaciones con paginación
  async findAll(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<{
    pageSize: number;
    pageNumber: number;
    totalRegisters: number;
    list: Conversation[];
  }> {
    const skip = (pageNumber - 1) * pageSize;
    const totalRegisters = await this.conversationRepository.count();

    const list = await this.conversationRepository.find({
      skip,
      take: pageSize,
      relations: ['user'], // Incluye relación con el usuario
    });

    return {
      pageSize,
      pageNumber,
      totalRegisters,
      list,
    };
  }

  // Obtener conversación por ID
  async findOne(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!conversation) {
      throw new NotFoundException(`Conversación con ID ${id} no encontrada.`);
    }
    return conversation;
  }

  // Actualizar conversación
  async update(
    id: number,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.findOne(id);

    const updatedConversation = this.conversationRepository.merge(
      conversation,
      updateConversationDto,
    );
    return await this.conversationRepository.save(updatedConversation);
  }

  // Eliminar conversación
  async remove(id: number): Promise<void> {
    const conversation = await this.findOne(id);
    await this.conversationRepository.remove(conversation);
  }
}
