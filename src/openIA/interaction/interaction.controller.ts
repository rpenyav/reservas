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
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { ReservasGuard } from 'src/guards/reservas.guard';

@UseGuards(ReservasGuard)
@Controller('interactions')
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @UseGuards(ReservasGuard)
  @Post()
  async create(@Body() createInteractionDto: CreateInteractionDto) {
    return await this.interactionService.create(createInteractionDto);
  }

  @UseGuards(ReservasGuard)
  @Get()
  async findAll(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return await this.interactionService.findAll(pageNumber, pageSize);
  }

  @UseGuards(ReservasGuard)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.interactionService.findOne(id);
  }

  @UseGuards(ReservasGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateInteractionDto: UpdateInteractionDto,
  ) {
    return await this.interactionService.update(id, updateInteractionDto);
  }

  @UseGuards(ReservasGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.interactionService.remove(id);
    return { message: `Interacción con ID ${id} eliminada.` };
  }
}
