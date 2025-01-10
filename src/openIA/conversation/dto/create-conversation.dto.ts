import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateConversationDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @MaxLength(255)
  conversationTitle: string;

  @IsOptional()
  @IsEnum(['activa', 'finalizada'])
  status: 'activa' | 'finalizada' = 'activa';
}
