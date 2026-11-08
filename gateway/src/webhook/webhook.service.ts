import { Injectable, Logger } from '@nestjs/common';

interface MensagemWhatsApp {
  from?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
  image?: { caption?: string };
  video?: { caption?: string };
  document?: { caption?: string };
}

interface StatusWhatsApp {
  id?: string;
  status?: string;
  recipient_id?: string;
  errors?: { code?: number; title?: string }[];
}

interface ValorWhatsApp {
  messages?: MensagemWhatsApp[];
  statuses?: StatusWhatsApp[];
}

interface EventoWhatsApp {
  entry?: { changes?: { value?: ValorWhatsApp }[] }[];
}

const LIMITE_TEXTO = 100;

/**
 * Só registra no log o que chegou. Encaminhar para VIC/HEX e responder pela
 * API de envio fica para a Fase 2.
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger('WebhookWhatsApp');

  registrar(evento: EventoWhatsApp): void {
    for (const entrada of evento?.entry ?? []) {
      for (const mudanca of entrada?.changes ?? []) {
        const valor = mudanca?.value;
        for (const mensagem of valor?.messages ?? []) {
          this.registrarMensagem(mensagem);
        }
        for (const status of valor?.statuses ?? []) {
          this.registrarStatus(status);
        }
      }
    }
  }

  private registrarMensagem(m: MensagemWhatsApp): void {
    const texto = (
      m.text?.body ??
      m.button?.text ??
      m.interactive?.button_reply?.title ??
      m.interactive?.list_reply?.title ??
      m.image?.caption ??
      m.video?.caption ??
      m.document?.caption ??
      ''
    ).slice(0, LIMITE_TEXTO);

    this.logger.log(
      `mensagem wa_id=${m.from} type=${m.type} id=${m.id} texto=${JSON.stringify(texto)}`,
    );
  }

  private registrarStatus(s: StatusWhatsApp): void {
    const erro = s.errors?.length
      ? ` erro=${s.errors.map((e) => `${e.code}:${e.title}`).join(',')}`
      : '';
    this.logger.log(
      `status ${s.status} id=${s.id} wa_id=${s.recipient_id}${erro}`,
    );
  }
}
