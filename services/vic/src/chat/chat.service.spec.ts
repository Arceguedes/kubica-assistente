import type Anthropic from '@anthropic-ai/sdk';
import { ChatService } from './chat.service.js';
import type { ChatRepository } from './chat.repository.js';
import { SYSTEM_PROMPT } from '../prompt.js';

const CONVERSA = '5b0d8f0e-6c1a-4a53-9a55-2f0f4a1c9a11';

function deltas(...textos: string[]) {
  return (async function* () {
    for (const text of textos) {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text } };
    }
  })();
}

function montar(historico: { papel: 'user' | 'assistant'; texto: string }[]) {
  const repo = {
    ultimas: vi.fn().mockResolvedValue(historico),
    gravarTroca: vi.fn().mockResolvedValue(undefined),
  };
  const stream = vi.fn().mockReturnValue(deltas('Oi, ', 'Ana!'));
  const claude = { messages: { stream } };
  const service = new ChatService(
    repo as unknown as ChatRepository,
    claude as unknown as Anthropic,
  );
  return { repo, stream, service };
}

async function consumir(gen: AsyncGenerator<string>): Promise<string> {
  let texto = '';
  for await (const pedaco of gen) texto += pedaco;
  return texto;
}

describe('ChatService', () => {
  it('devolve a resposta em pedaços e grava a troca no fim', async () => {
    const { repo, service } = montar([]);

    const texto = await consumir(service.responder(CONVERSA, 'meu nome é Ana'));

    expect(texto).toBe('Oi, Ana!');
    expect(repo.ultimas).toHaveBeenCalledWith(CONVERSA, 20);
    expect(repo.gravarTroca).toHaveBeenCalledWith(
      CONVERSA,
      'meu nome é Ana',
      'Oi, Ana!',
    );
  });

  it('envia o histórico ao Claude com os parâmetros combinados', async () => {
    const { stream, service } = montar([
      { papel: 'user', texto: 'meu nome é Ana' },
      { papel: 'assistant', texto: 'Prazer, Ana!' },
    ]);

    await consumir(service.responder(CONVERSA, 'qual é meu nome?'));

    expect(stream).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-5-5',
        max_tokens: 600,
        messages: [
          { role: 'user', content: 'meu nome é Ana' },
          { role: 'assistant', content: 'Prazer, Ana!' },
          { role: 'user', content: 'qual é meu nome?' },
        ],
      }),
    );
  });

  it('envia o SYSTEM_PROMPT da VIC no campo system', async () => {
    const { stream, service } = montar([]);

    await consumir(service.responder(CONVERSA, 'oi'));

    expect(stream).toHaveBeenCalledWith(
      expect.objectContaining({ system: SYSTEM_PROMPT }),
    );
  });

  it('descarta respostas soltas no começo do histórico (a API exige começar por user)', async () => {
    const { stream, service } = montar([
      { papel: 'assistant', texto: 'resposta sem pergunta' },
      { papel: 'user', texto: 'oi' },
      { papel: 'assistant', texto: 'olá' },
    ]);

    await consumir(service.responder(CONVERSA, 'tudo bem?'));

    const { messages } = stream.mock.calls[0][0];
    expect(messages[0]).toEqual({ role: 'user', content: 'oi' });
    expect(messages).toHaveLength(3);
  });

  it('não grava nada se o Claude falhar no meio da resposta', async () => {
    const { repo, stream, service } = montar([]);
    stream.mockReturnValue(
      (async function* () {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Oi' } };
        throw new Error('falha de rede');
      })(),
    );

    await expect(consumir(service.responder(CONVERSA, 'oi'))).rejects.toThrow(
      'falha de rede',
    );
    expect(repo.gravarTroca).not.toHaveBeenCalled();
  });
});
