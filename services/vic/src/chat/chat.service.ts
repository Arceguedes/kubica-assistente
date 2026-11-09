import type Anthropic from '@anthropic-ai/sdk';
import { Inject, Injectable } from '@nestjs/common';
import { ANTHROPIC_CLIENT } from '../claude/anthropic.provider.js';
import { ChatRepository, type MensagemSalva } from './chat.repository.js';

import { SYSTEM_PROMPT } from '../prompt.js';

const MODELO = 'claude-sonnet-5-5';

@Injectable()
export class ChatService {
  constructor(
    private readonly repo: ChatRepository,
    @Inject(ANTHROPIC_CLIENT) private readonly claude: Anthropic,
  ) {}

  /**
   * Devolve a resposta do Claude aos pedaços (streaming).
   * Lê o histórico do banco a cada chamada e só grava pergunta e resposta
   * quando a resposta termina inteira. Nada fica na memória do processo.
   */
  async *responder(
    conversaId: string,
    mensagem: string,
  ): AsyncGenerator<string, void, void> {
    const historico = await this.repo.ultimas(conversaId, 20);
    const messages = this.montarMensagens(historico, mensagem);

    const stream = this.claude.messages.stream({
      model: MODELO,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages,
    });

    let resposta = '';
    for await (const evento of stream) {
      if (
        evento.type === 'content_block_delta' &&
        evento.delta.type === 'text_delta'
      ) {
        resposta += evento.delta.text;
        yield evento.delta.text;
      }
    }

    if (resposta.trim()) {
      await this.repo.gravarTroca(conversaId, mensagem, resposta);
    }
  }

  /** A API exige que a lista comece com uma mensagem do usuário. */
  private montarMensagens(
    historico: MensagemSalva[],
    mensagem: string,
  ): { role: 'user' | 'assistant'; content: string }[] {
    const inicio = historico.findIndex((m) => m.papel === 'user');
    const util = inicio === -1 ? [] : historico.slice(inicio);
    return [
      ...util.map((m) => ({ role: m.papel, content: m.texto })),
      { role: 'user', content: mensagem },
    ];
  }
}
