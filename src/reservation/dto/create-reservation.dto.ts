import { IsInt, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  slotId: number;

  @IsOptional()
  @IsEnum(['pendiente', 'confirmada', 'cancelada'])
  status: 'pendiente' | 'confirmada' | 'cancelada' = 'pendiente';
}
