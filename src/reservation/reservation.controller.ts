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
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservasGuard } from 'src/guards/reservas.guard';

@UseGuards(ReservasGuard)
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @UseGuards(ReservasGuard)
  @Post()
  async create(@Body() createReservationDto: CreateReservationDto) {
    return await this.reservationService.create(createReservationDto);
  }

  @UseGuards(ReservasGuard)
  @Get()
  async findAll(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return await this.reservationService.findAll(pageNumber, pageSize);
  }

  @UseGuards(ReservasGuard)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.reservationService.findOne(id);
  }

  @UseGuards(ReservasGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return await this.reservationService.update(id, updateReservationDto);
  }

  @UseGuards(ReservasGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.reservationService.remove(id);
    return { message: `Reserva con ID ${id} eliminada.` };
  }
  @UseGuards(ReservasGuard)
  @Get('track/:trackingCode')
  async findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    return await this.reservationService.findByTrackingCode(trackingCode);
  }
}
