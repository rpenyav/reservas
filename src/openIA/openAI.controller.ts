import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReservasGuard } from '../guards/reservas.guard';
import { SlotService } from 'src/slot/slot.service';
import { OpenAIService } from './openAI.service';

@UseGuards(ReservasGuard)
@Controller('ai')
export class OpenAIController {
  constructor(
    private readonly slotService: SlotService,
    private readonly openAIService: OpenAIService,
  ) {}

  @Post('generate-response')
  async generateResponse(
    @Body() body: { humanMessage: string },
    @Res() res: Response,
  ) {
    const { humanMessage } = body;

    // Analizar el mensaje para extraer filtros
    const filters = this.extractFiltersFromMessage(humanMessage);

    // Consultar los slots disponibles según los filtros
    const slots = await this.slotService.searchSlots(
      filters.lawyerSpeciality, // Nuevo filtro
      filters.lawyerId,
      filters.available,
      filters.startDate,
      filters.endDate,
    );

    // Crear texto con los resultados
    let slotsText;
    if (slots.length > 0) {
      slotsText = slots
        .map(
          (slot) =>
            `- Fecha: ${slot.dateStart.toLocaleDateString()} ${slot.dateStart.toLocaleTimeString()} - ${slot.dateEnd.toLocaleTimeString()}\n` +
            `  Abogado: ${slot.lawyer.firstName} ${slot.lawyer.secondName} (${slot.lawyer.speciality})`,
        )
        .join('\n');
    } else {
      slotsText = `No hay slots disponibles según los criterios indicados.`;
    }

    const prompt = `
  ### Pregunta del Humano:
  ${humanMessage}
  
  ### Resultados de la Base de Datos:
  ${slotsText}
  
  ### Instrucción:
  Responde al usuario en formato Markdown, utilizando listas desordenadas para organizar los datos si hay múltiples resultados.
  `;

    // Configuración de headers para streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generar respuesta en streaming desde OpenAI
    await this.openAIService.generateStreamingResponse(prompt, (chunk: any) => {
      res.write(chunk); // Enviar cada chunk al cliente
    });

    res.end(); // Finalizar la transmisión
  }

  // src/openAI/openAI.controller.ts
  private extractFiltersFromMessage(message: string): {
    lawyerId?: number;
    lawyerSpeciality?: string;
    available?: boolean;
    startDate?: string;
    endDate?: string;
    targetTime?: string;
  } {
    const lawyerMatch = message.match(/abogado con el ID (\d+)/);
    const lawyerId = lawyerMatch ? parseInt(lawyerMatch[1]) : undefined;

    const specialityMatch = message.match(/especializado en ([\w\s]+)/i);
    const lawyerSpeciality = specialityMatch
      ? specialityMatch[1].trim()
      : undefined;

    const targetTimeMatch = message.match(/\d{1,2}:\d{2}/);
    const targetTime = targetTimeMatch ? targetTimeMatch[0] : undefined;

    const startDate = '2025-01-10T00:00:00Z';
    const endDate = '2025-01-20T00:00:00Z';

    return {
      lawyerId,
      lawyerSpeciality, // Incluir especialidad
      available: true,
      startDate,
      endDate,
      targetTime: targetTime ? `2025-01-15T${targetTime}:00Z` : undefined,
    };
  }
}
