import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // O ConfigModule já carregou o .env da raiz ao importar o AppModule.
  if (!process.env.VIC_ANTHROPIC_API_KEY) {
    console.error('Falta VIC_ANTHROPIC_API_KEY no .env da raiz');
    process.exit(1);
  }
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
