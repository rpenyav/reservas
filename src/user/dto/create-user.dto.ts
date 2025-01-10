import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(6)
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  secondName: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  documentNumber?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  telefono?: string;

  @IsEnum(['cliente', 'admin'])
  @IsNotEmpty()
  role: 'cliente' | 'admin';
}
