import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lawyer } from '../entities/lawyer.entity';
import { CreateLawyerDto } from './dto/create-lawyer.dto';
import { UpdateLawyerDto } from './dto/update-lawyer.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class LawyerService {
  constructor(
    @InjectRepository(Lawyer)
    private readonly lawyerRepository: Repository<Lawyer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Crear abogado
  async create(createLawyerDto: CreateLawyerDto): Promise<Lawyer> {
    // Verificar si el correo ya está en uso por otro abogado o usuario
    const existingUser = await this.userRepository.findOne({
      where: { email: createLawyerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException(
        'El correo ya está en uso por otro usuario.',
      );
    }

    // Crear el abogado
    const lawyer = this.lawyerRepository.create(createLawyerDto);
    return await this.lawyerRepository.save(lawyer);
  }

  // Obtener todos los abogados con paginación
  async findAll(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<{
    pageSize: number;
    pageNumber: number;
    totalRegisters: number;
    list: Lawyer[];
  }> {
    const skip = (pageNumber - 1) * pageSize;
    const totalRegisters = await this.lawyerRepository.count();

    const list = await this.lawyerRepository.find({
      skip,
      take: pageSize,
    });

    return {
      pageSize,
      pageNumber,
      totalRegisters,
      list,
    };
  }

  // Obtener abogado por ID
  async findOne(id: number): Promise<Lawyer> {
    const lawyer = await this.lawyerRepository.findOne({ where: { id } });
    if (!lawyer) {
      throw new NotFoundException(`Abogado con ID ${id} no encontrado.`);
    }
    return lawyer;
  }

  // Actualizar abogado
  async update(id: number, updateLawyerDto: UpdateLawyerDto): Promise<Lawyer> {
    const lawyer = await this.findOne(id);

    if (updateLawyerDto.email && updateLawyerDto.email !== lawyer.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateLawyerDto.email },
      });
      if (existingUser) {
        throw new BadRequestException(
          'El correo ya está en uso por otro usuario.',
        );
      }
    }

    const updatedLawyer = this.lawyerRepository.merge(lawyer, updateLawyerDto);
    return await this.lawyerRepository.save(updatedLawyer);
  }

  // Eliminar abogado
  async remove(id: number): Promise<void> {
    const lawyer = await this.findOne(id);
    await this.lawyerRepository.remove(lawyer);
  }
}
