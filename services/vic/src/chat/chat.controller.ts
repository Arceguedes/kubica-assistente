import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatDto } from './chat.dto.js';
import { ChatService } from './chat.service.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  @HttpCode(200)
  async conversar(@Body() dto: ChatDto, @Res() res: Response): Promise<void> {
    let comecou = false;
    try {
      for await (const pedaco of this.chat.responder(
        dto.conversaId,
        dto.mensagem,
      )) {
        if (!comecou) {
          comecou = true;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
        }
        res.write(pedaco);
      }
      res.end();
    } catch (err) {
      // Antes do primeiro pedaço, o Nest ainda consegue responder com erro HTTP.
      // Depois disso o status já foi enviado: só resta encerrar a conexão.
      if (!comecou) throw err;
      res.destroy(err instanceof Error ? err : undefined);
    }
  }
}
