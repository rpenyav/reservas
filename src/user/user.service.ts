import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Crear usuario
  // Crear usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('createUserDto:', createUserDto); // Registro para depuración

    if (!createUserDto.password) {
      throw new BadRequestException('La contraseña es obligatoria.');
    }

    // Verificar si el email ya está en uso
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('El correo ya está en uso.');
    }

    // Verificar si el documentNumber ya está en uso (si se proporcionó)
    if (createUserDto.documentNumber) {
      const existingDocument = await this.userRepository.findOne({
        where: { documentNumber: createUserDto.documentNumber },
      });
      if (existingDocument) {
        throw new BadRequestException('El número de documento ya está en uso.');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  // Obtener usuarios con paginación
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
    list: User[];
  }> {
    const skip = (pageNumber - 1) * pageSize;
    const totalRegisters = await this.userRepository.count();

    const list = await this.userRepository.find({
      order: { [sortedBy]: sortOrder },
      skip,
      take: pageSize,
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

  // Obtener usuario por ID
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return user;
  }

  // Actualizar usuario
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Buscar el usuario a actualizar
    const user = await this.findOne(id);

    // Validar si el email ya está en uso por otro usuario
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(
          'El correo ya está en uso por otro usuario.',
        );
      }
    }

    // Validar si el documentNumber ya está en uso por otro usuario
    if (
      updateUserDto.documentNumber &&
      updateUserDto.documentNumber !== user.documentNumber
    ) {
      const existingDocument = await this.userRepository.findOne({
        where: { documentNumber: updateUserDto.documentNumber },
      });
      if (existingDocument && existingDocument.id !== id) {
        throw new BadRequestException(
          'El número de documento ya está en uso por otro usuario.',
        );
      }
    }

    // Si se envía un nuevo password, encriptarlo
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar los datos del usuario
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(updatedUser);
  }

  // Eliminar usuario
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // Login
  async login(
    email: string,
    password: string,
  ): Promise<{ auth_token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Credenciales incorrectas.');
    }

    // Crear payload del token
    const payload = {
      email: user.email,
      role: user.role,
    };

    // Generar el token JWT
    const auth_token = this.jwtService.sign(payload, {
      expiresIn: '24h', // Tiempo de expiración del token
    });

    return { auth_token };
  }
}
