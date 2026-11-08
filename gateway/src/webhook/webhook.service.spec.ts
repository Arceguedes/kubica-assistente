import { Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service.js';

describe('WebhookService', () => {
  it('registra mensagem (texto cortado em 100) e status numa linha', () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const service = new WebhookService();

    service.registrar({
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    from: '5511999999999',
                    id: 'wamid.A',
                    type: 'text',
                    text: { body: 'x'.repeat(150) },
                  },
                ],
                statuses: [
                  {
                    id: 'wamid.B',
                    status: 'delivered',
                    recipient_id: '5511888888888',
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0][0]).toBe(
      `mensagem wa_id=5511999999999 type=text id=wamid.A texto="${'x'.repeat(100)}"`,
    );
    expect(log.mock.calls[1][0]).toBe(
      'status delivered id=wamid.B wa_id=5511888888888',
    );
    log.mockRestore();
  });
});
