import { createHmac } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// Valores falsos: process.env tem prioridade sobre o .env da raiz.
const VERIFY_TOKEN = 'token-de-teste-123';
const APP_SECRET = 'segredo-de-teste-456';

const evento = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '0',
      changes: [
        {
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            contacts: [{ wa_id: '5511999999999', profile: { name: 'Teste' } }],
            messages: [
              {
                from: '5511999999999',
                id: 'wamid.TESTE',
                timestamp: '1700000000',
                type: 'text',
                text: { body: 'Olá!' },
              },
            ],
          },
        },
      ],
    },
  ],
};

function assinar(corpo: string, segredo = APP_SECRET): string {
  return 'sha256=' + createHmac('sha256', segredo).update(corpo).digest('hex');
}

describe('Webhook WhatsApp (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.WHATSAPP_VERIFY_TOKEN = VERIFY_TOKEN;
    process.env.WHATSAPP_APP_SECRET = APP_SECRET;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true, logger: false });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET com token certo devolve o challenge em text/plain', async () => {
    const res = await request(app.getHttpServer())
      .get('/webhook/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': '1158201444',
      })
      .expect(200);

    expect(res.text).toBe('1158201444');
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
  });

  it('GET com token errado responde 403', () => {
    return request(app.getHttpServer())
      .get('/webhook/whatsapp')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'errado',
        'hub.challenge': '1158201444',
      })
      .expect(403);
  });

  it('POST com assinatura válida responde 200', () => {
    const corpo = JSON.stringify(evento);
    return request(app.getHttpServer())
      .post('/webhook/whatsapp')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', assinar(corpo))
      .send(corpo)
      .expect(200);
  });

  it('POST com assinatura inválida responde 401', () => {
    const corpo = JSON.stringify(evento);
    return request(app.getHttpServer())
      .post('/webhook/whatsapp')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', assinar(corpo, 'outro-segredo'))
      .send(corpo)
      .expect(401);
  });
});
