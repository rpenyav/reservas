import { IsDateString, IsInt, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateSlotDto {
  @IsInt()
  @IsNotEmpty()
  lawyerId: number;

  @IsDateString()
  @IsNotEmpty()
  dateStart: string;

  @IsDateString()
  @IsNotEmpty()
  dateEnd: string;

  @IsBoolean()
  available: boolean;
}
