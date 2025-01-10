import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LawyerService } from './lawyer.service';
import { CreateLawyerDto } from './dto/create-lawyer.dto';
import { UpdateLawyerDto } from './dto/update-lawyer.dto';
import { ReservasGuard } from 'src/guards/reservas.guard';

@UseGuards(ReservasGuard) // Aplicar el guard para proteger las rutas
@Controller('lawyers')
export class LawyerController {
  constructor(private readonly lawyerService: LawyerService) {}

  @UseGuards(ReservasGuard)
  @Post()
  async create(@Body() createLawyerDto: CreateLawyerDto) {
    return await this.lawyerService.create(createLawyerDto);
  }

  @UseGuards(ReservasGuard)
  @Get()
  async findAll(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return await this.lawyerService.findAll(pageNumber, pageSize);
  }

  @UseGuards(ReservasGuard)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.lawyerService.findOne(id);
  }

  @UseGuards(ReservasGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateLawyerDto: UpdateLawyerDto,
  ) {
    return await this.lawyerService.update(id, updateLawyerDto);
  }

  @UseGuards(ReservasGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.lawyerService.remove(id);
    return { message: `Abogado con ID ${id} eliminado.` };
  }
}
