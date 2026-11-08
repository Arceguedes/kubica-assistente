import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { rootEnvPath } from './config/env-path.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: rootEnvPath() }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
