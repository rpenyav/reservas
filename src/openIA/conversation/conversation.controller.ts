import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ReservasGuard } from 'src/guards/reservas.guard';

@UseGuards(ReservasGuard)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(ReservasGuard)
  @Post()
  async create(@Body() createConversationDto: CreateConversationDto) {
    return await this.conversationService.create(createConversationDto);
  }

  @UseGuards(ReservasGuard)
  @Get()
  async findAll(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return await this.conversationService.findAll(pageNumber, pageSize);
  }

  @UseGuards(ReservasGuard)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.conversationService.findOne(id);
  }

  @UseGuards(ReservasGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return await this.conversationService.update(id, updateConversationDto);
  }

  @UseGuards(ReservasGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.conversationService.remove(id);
    return { message: `Conversación con ID ${id} eliminada.` };
  }
}
