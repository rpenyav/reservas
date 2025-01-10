import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateInteractionDto {
  @IsInt()
  @IsNotEmpty()
  conversationId: number;

  @IsNotEmpty()
  humanMessage: string;

  @IsOptional()
  botMessage?: string;
}
