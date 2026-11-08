import Anthropic from '@anthropic-ai/sdk';
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const ANTHROPIC_CLIENT = Symbol('ANTHROPIC_CLIENT');

/** Cliente do Claude da VIC, criado com a chave VIC_ANTHROPIC_API_KEY. */
export const anthropicProvider: Provider = {
  provide: ANTHROPIC_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Anthropic => {
    const apiKey = config.get<string>('VIC_ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('Falta VIC_ANTHROPIC_API_KEY no .env da raiz');
    }
    return new Anthropic({ apiKey });
  },
};
