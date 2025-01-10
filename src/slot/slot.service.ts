import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, Repository } from 'typeorm';
import { Slot } from '../entities/slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Lawyer } from '../entities/lawyer.entity';
import { Reservation } from '../entities/reservation.entity';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,

    @InjectRepository(Lawyer)
    private readonly lawyerRepository: Repository<Lawyer>, // Asegúrate de incluir LawyerRepository

    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>, // Si también es necesario
  ) {}

  // Verificar que el lawyerId exista
  private async validateLawyerId(lawyerId: number): Promise<void> {
    const lawyerExists = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });
    if (!lawyerExists) {
      throw new BadRequestException(`El abogado con ID ${lawyerId} no existe.`);
    }
  }

  // Crear slot
  async create(createSlotDto: CreateSlotDto): Promise<Slot> {
    const { lawyerId, dateStart, dateEnd } = createSlotDto;

    // Validar que el lawyerId exista
    await this.validateLawyerId(lawyerId);

    // Convertir fechas
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    // Verificar si ya existe un slot con el mismo abogado, fecha y hora
    const existingSlot = await this.slotRepository.findOne({
      where: { lawyerId, dateStart: startDate, dateEnd: endDate },
    });
    if (existingSlot) {
      throw new BadRequestException(
        'Ya existe un slot para este abogado en la misma fecha y hora.',
      );
    }

    // Crear el slot
    const slot = this.slotRepository.create({
      ...createSlotDto,
      dateStart: startDate,
      dateEnd: endDate,
    });
    return await this.slotRepository.save(slot);
  }

  // Actualizar slot
  async update(id: number, updateSlotDto: UpdateSlotDto): Promise<Slot> {
    const slot = await this.findOne(id);

    // Validar que el lawyerId exista si se actualiza
    if (updateSlotDto.lawyerId !== undefined) {
      await this.validateLawyerId(updateSlotDto.lawyerId);
    }

    // Convertir fechas a objetos Date si se proporcionan
    const startDate = updateSlotDto.dateStart
      ? new Date(updateSlotDto.dateStart)
      : slot.dateStart;
    const endDate = updateSlotDto.dateEnd
      ? new Date(updateSlotDto.dateEnd)
      : slot.dateEnd;

    // Validar duplicados solo si lawyerId, dateStart o dateEnd cambian
    if (
      updateSlotDto.lawyerId !== undefined ||
      updateSlotDto.dateStart !== undefined ||
      updateSlotDto.dateEnd !== undefined
    ) {
      const conflictingSlot = await this.slotRepository.findOne({
        where: {
          lawyerId: updateSlotDto.lawyerId || slot.lawyerId,
          dateStart: startDate,
          dateEnd: endDate,
        },
      });

      // Si el slot conflictivo no es el mismo registro, lanzar error
      if (conflictingSlot && conflictingSlot.id !== id) {
        throw new BadRequestException(
          'Ya existe un slot para este abogado en la misma fecha y hora.',
        );
      }
    }

    // Actualizar el slot (permitir cambios de available independientemente)
    const updatedSlot = this.slotRepository.merge(slot, {
      ...updateSlotDto,
      dateStart: startDate,
      dateEnd: endDate,
    });

    return await this.slotRepository.save(updatedSlot);
  }

  // Eliminar slot
  async remove(id: number): Promise<void> {
    const slot = await this.findOne(id);

    // Verificar si el slot tiene reservas asociadas
    const reservations = await this.reservationRepository.find({
      where: { slotId: id },
    });
    if (reservations.length > 0) {
      throw new BadRequestException(
        'El slot tiene reservas asociadas y no puede eliminarse.',
      );
    }

    await this.slotRepository.remove(slot);
  }

  // Obtener slot por ID
  async findOne(id: number): Promise<Slot> {
    const slot = await this.slotRepository.findOne({ where: { id } });
    if (!slot) {
      throw new NotFoundException(`Slot con ID ${id} no encontrado.`);
    }
    return slot;
  }

  async findAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortedBy: string = 'id',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{
    pageSize: number;
    pageNumber: number;
    totalRegisters: number;
    sortedBy: string;
    sortOrder: 'ASC' | 'DESC';
    list: Slot[];
  }> {
    const skip = (pageNumber - 1) * pageSize;
    const totalRegisters = await this.slotRepository.count();

    const list = await this.slotRepository.find({
      order: { [sortedBy]: sortOrder as FindOptionsOrderValue },
      skip,
      take: pageSize,
      relations: ['lawyer'], // Incluye información del abogado asociado
    });

    return {
      pageSize,
      pageNumber,
      totalRegisters,
      sortedBy,
      sortOrder,
      list,
    };
  }

  async searchSlots(
    lawyerId?: number,
    available?: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<Slot[]> {
    const query = this.slotRepository.createQueryBuilder('slot');

    if (lawyerId) {
      query.andWhere('slot.lawyerId = :lawyerId', { lawyerId });
    }
    if (available !== undefined) {
      query.andWhere('slot.available = :available', { available });
    }
    if (startDate) {
      query.andWhere('slot.dateStart >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      query.andWhere('slot.dateEnd <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    return await query.getMany();
  }
}
