import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateLawyerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  secondName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(15)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  speciality?: string;
}
