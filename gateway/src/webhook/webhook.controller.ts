import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Headers,
  HttpCode,
  Logger,
  Post,
  Query,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { assinaturaValida } from './assinatura.js';
import { WebhookService } from './webhook.service.js';

@Controller('webhook/whatsapp')
export class WebhookController {
  private readonly logger = new Logger('WebhookWhatsApp');

  constructor(
    private readonly config: ConfigService,
    private readonly webhook: WebhookService,
  ) {}

  /** Verificação do webhook pela Meta: devolve o hub.challenge cru. */
  @Get()
  @Header('Content-Type', 'text/plain')
  verificar(
    @Query('hub.mode') modo?: string,
    @Query('hub.verify_token') token?: string,
    @Query('hub.challenge') desafio?: string,
  ): string {
    const esperado = this.config.get<string>('WHATSAPP_VERIFY_TOKEN');
    if (modo === 'subscribe' && esperado && token === esperado) {
      return desafio ?? '';
    }
    throw new ForbiddenException();
  }

  /** Eventos (mensagens e status). Responde 200 na hora e registra depois. */
  @Post()
  @HttpCode(200)
  receber(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') assinatura: string | undefined,
    @Body() corpo: unknown,
  ): string {
    const segredo = this.config.get<string>('WHATSAPP_APP_SECRET');
    if (!segredo) {
      this.logger.warn('WHATSAPP_APP_SECRET não definido; evento recusado');
    }
    if (!assinaturaValida(req.rawBody, assinatura, segredo)) {
      throw new UnauthorizedException();
    }

    setImmediate(() => {
      try {
        this.webhook.registrar(
          corpo as Parameters<WebhookService['registrar']>[0],
        );
      } catch (erro) {
        this.logger.error('Falha ao registrar evento', erro as Error);
      }
    });
    return 'EVENT_RECEIVED';
  }
}
