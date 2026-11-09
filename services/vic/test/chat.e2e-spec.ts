import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type pg from 'pg';
import { AppModule } from './../src/app.module.js';
import { PG_POOL } from './../src/database/database.module.js';

// Precisa do Postgres do compose no ar (npm run infra:up) e da VIC_ANTHROPIC_API_KEY.
describe('Chat (e2e)', () => {
  let app: INestApplication<App>;
  let pool: pg.Pool;
  const conversas: string[] = [];

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    pool = app.get<pg.Pool>(PG_POOL);
    const sql = readFileSync(
      join(import.meta.dirname, '..', 'migrations', '001_vic_mensagens.sql'),
      'utf8',
    );
    await pool.query(sql);
  });

  afterAll(async () => {
    if (conversas.length) {
      await pool.query('DELETE FROM vic_mensagens WHERE conversa_id = ANY($1)', [
        conversas,
      ]);
    }
    await app.close();
  });

  it('GET /health confere o Postgres', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.info.postgres.status).toBe('up');
  });

  it('POST /chat com 501 caracteres devolve 400', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ conversaId: randomUUID(), mensagem: 'a'.repeat(501) })
      .expect(400);
  });

  it('POST /chat rejeita conversaId inválido e campos extras', async () => {
    await request(app.getHttpServer())
      .post('/chat')
      .send({ conversaId: 'nao-e-uuid', mensagem: 'oi' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/chat')
      .send({ conversaId: randomUUID(), mensagem: 'oi', extra: 1 })
      .expect(400);
  });

  it('lembra o nome da pessoa entre duas mensagens', async () => {
    const conversaId = randomUUID();
    conversas.push(conversaId);

    await request(app.getHttpServer())
      .post('/chat')
      .send({ conversaId, mensagem: 'meu nome é Ana' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .post('/chat')
      .send({ conversaId, mensagem: 'qual é meu nome?' })
      .expect(200);

    expect(res.text).toContain('Ana');

    const { rows } = await pool.query(
      'SELECT papel FROM vic_mensagens WHERE conversa_id = $1 ORDER BY criado_em, id',
      [conversaId],
    );
    expect(rows.map((r) => r.papel)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant',
    ]);
  }, 90_000);
});
