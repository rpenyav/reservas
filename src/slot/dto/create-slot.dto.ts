import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateSlotDto {
  @IsInt()
  @IsNotEmpty()
  lawyerId: number;

  @IsDateString()
  @IsNotEmpty()
  dateStart: string; // Cadena ISO

  @IsDateString()
  @IsNotEmpty()
  dateEnd: string; // Cadena ISO

  @IsBoolean()
  @IsOptional()
  available?: boolean = true;
}
