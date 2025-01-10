import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Slot } from '../entities/slot.entity';
import { User } from '../entities/user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Crear reserva
  // Crear reserva
  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    const { userId, slotId, status } = createReservationDto;

    // Verificar si el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`El usuario con ID ${userId} no existe.`);
    }

    // Verificar si el slot existe y está disponible
    const slot = await this.slotRepository.findOne({ where: { id: slotId } });
    if (!slot) {
      throw new BadRequestException(`El slot con ID ${slotId} no existe.`);
    }
    if (!slot.available) {
      throw new BadRequestException(
        `El slot con ID ${slotId} no está disponible.`,
      );
    }

    // Generar código de seguimiento único
    const trackingCode = randomBytes(10).toString('hex').slice(0, 10);

    // Crear la reserva
    const reservation = this.reservationRepository.create({
      userId,
      slotId,
      lawyerId: slot.lawyerId,
      status,
      trackingCode,
    });

    // Marcar el slot como no disponible
    slot.available = false;
    await this.slotRepository.save(slot);

    return await this.reservationRepository.save(reservation);
  }

  // Obtener todas las reservas con paginación
  async findAll(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<{
    pageSize: number;
    pageNumber: number;
    totalRegisters: number;
    list: Reservation[];
  }> {
    const skip = (pageNumber - 1) * pageSize;
    const totalRegisters = await this.reservationRepository.count();

    const list = await this.reservationRepository.find({
      skip,
      take: pageSize,
      relations: ['user', 'slot'], // Incluir relaciones
    });

    return {
      pageSize,
      pageNumber,
      totalRegisters,
      list,
    };
  }

  // Obtener reserva por ID
  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'slot'],
    });
    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada.`);
    }
    return reservation;
  }

  // Actualizar reserva
  async update(
    id: number,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    const updatedReservation = this.reservationRepository.merge(
      reservation,
      updateReservationDto,
    );
    return await this.reservationRepository.save(updatedReservation);
  }

  // Eliminar reserva
  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);

    // Marcar el slot como disponible
    const slot = await this.slotRepository.findOne({
      where: { id: reservation.slotId },
    });
    if (slot) {
      slot.available = true;
      await this.slotRepository.save(slot);
    }

    await this.reservationRepository.remove(reservation);
  }

  async findByTrackingCode(trackingCode: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { trackingCode },
      relations: ['user', 'slot', 'lawyer'],
    });
    if (!reservation) {
      throw new NotFoundException(
        `No se encontró una reserva con el código de seguimiento ${trackingCode}.`,
      );
    }
    return reservation;
  }
}
