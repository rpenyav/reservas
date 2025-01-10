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
import { SlotService } from './slot.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { ReservasGuard } from 'src/guards/reservas.guard';

@UseGuards(ReservasGuard)
@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post()
  async create(@Body() createSlotDto: CreateSlotDto) {
    return await this.slotService.create(createSlotDto);
  }

  @Get('search')
  async search(
    @Query('lawyerId') lawyerId?: number,
    @Query('available') available?: string, // `available` como string
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.slotService.searchSlots(
      lawyerId ? +lawyerId : undefined,
      available !== undefined ? available === 'true' : undefined, // Convertir string a boolean
      startDate,
      endDate,
    );
  }

  @Get()
  async findAll(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('sortedBy') sortedBy: string = 'id',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    return await this.slotService.findAll(
      pageNumber,
      pageSize,
      sortedBy,
      sortOrder,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.slotService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateSlotDto: UpdateSlotDto) {
    return await this.slotService.update(id, updateSlotDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.slotService.remove(id);
    return { message: `Slot con ID ${id} eliminado.` };
  }
}
