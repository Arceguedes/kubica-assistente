import { Module } from '@nestjs/common';
import { ANTHROPIC_CLIENT, anthropicProvider } from './anthropic.provider.js';

@Module({
  providers: [anthropicProvider],
  exports: [ANTHROPIC_CLIENT],
})
export class ClaudeModule {}
