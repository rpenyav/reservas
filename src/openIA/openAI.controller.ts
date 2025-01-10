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
      filters.lawyerId,
      filters.available,
      filters.startDate,
      filters.endDate,
    );

    const targetTime = filters.targetTime ? new Date(filters.targetTime) : null;
    let exactSlot = null;
    let closestSlot = null;
    let closestTimeDifference = Infinity;

    slots.forEach((slot) => {
      const slotStart = new Date(slot.dateStart);
      const slotEnd = new Date(slot.dateEnd);

      if (targetTime && slotStart <= targetTime && slotEnd > targetTime) {
        exactSlot = slot;
      }

      if (targetTime && slotStart > targetTime) {
        const timeDifference = slotStart.getTime() - targetTime.getTime();
        if (timeDifference < closestTimeDifference) {
          closestTimeDifference = timeDifference;
          closestSlot = slot;
        }
      }
    });

    let slotsText;
    if (exactSlot) {
      slotsText = `### Slots Disponibles:\n\n- **Abogado ID**: ${exactSlot.lawyerId}\n  - **Fecha**: ${exactSlot.dateStart.toLocaleDateString()}\n  - **Hora**: ${exactSlot.dateStart.toLocaleTimeString()} - ${exactSlot.dateEnd.toLocaleTimeString()}`;
    } else if (closestSlot) {
      slotsText = `### No hay slots exactos disponibles:\n\n- **Slot más cercano**:\n  - **Abogado ID**: ${closestSlot.lawyerId}\n  - **Fecha**: ${closestSlot.dateStart.toLocaleDateString()}\n  - **Hora**: ${closestSlot.dateStart.toLocaleTimeString()} - ${closestSlot.dateEnd.toLocaleTimeString()}`;
    } else {
      slotsText = `### No hay slots disponibles para los criterios indicados.`;
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

  private extractFiltersFromMessage(message: string): {
    lawyerId?: number;
    available?: boolean;
    startDate?: string;
    endDate?: string;
    targetTime?: string;
  } {
    const lawyerMatch = message.match(/abogado con el ID (\d+)/);
    const lawyerId = lawyerMatch ? parseInt(lawyerMatch[1]) : undefined;

    const targetTimeMatch = message.match(/\d{1,2}:\d{2}/);
    const targetTime = targetTimeMatch ? targetTimeMatch[0] : undefined;

    const startDate = '2025-01-10T00:00:00Z';
    const endDate = '2025-01-20T00:00:00Z';

    return {
      lawyerId,
      available: true,
      startDate,
      endDate,
      targetTime: targetTime ? `2025-01-15T${targetTime}:00Z` : undefined,
    };
  }
}
