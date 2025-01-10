import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReservasGuard } from 'src/guards/reservas.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(ReservasGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @UseGuards(ReservasGuard)
  @Get()
  async findAll(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('sortedBy') sortedBy: string = 'id',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    return await this.userService.findAll(
      pageNumber,
      pageSize,
      sortedBy,
      sortOrder,
    );
  }

  @UseGuards(ReservasGuard)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(id);
  }

  @UseGuards(ReservasGuard) // Protección con el guard de autenticación
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(ReservasGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.userService.remove(id);
    return { message: `Usuario con ID ${id} eliminado.` };
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return await this.userService.login(loginDto.email, loginDto.password);
  }
}
