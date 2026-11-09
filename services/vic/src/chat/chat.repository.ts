import { Inject, Injectable } from '@nestjs/common';
import type pg from 'pg';
import { PG_POOL } from '../database/database.module.js';

export type Papel = 'user' | 'assistant';
export interface MensagemSalva {
  papel: Papel;
  texto: string;
}

@Injectable()
export class ChatRepository {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  /** Últimas `limite` mensagens da conversa, da mais antiga para a mais nova. */
  async ultimas(conversaId: string, limite = 20): Promise<MensagemSalva[]> {
    const { rows } = await this.pool.query<MensagemSalva>(
      `SELECT papel, texto FROM (
         SELECT papel, texto, criado_em, id
           FROM vic_mensagens
          WHERE conversa_id = $1
          ORDER BY criado_em DESC, id DESC
          LIMIT $2
       ) recentes
       ORDER BY criado_em ASC, id ASC`,
      [conversaId, limite],
    );
    return rows;
  }

  /** Grava pergunta e resposta juntas: ou entram as duas, ou nenhuma. */
  async gravarTroca(
    conversaId: string,
    pergunta: string,
    resposta: string,
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const sql =
        'INSERT INTO vic_mensagens (conversa_id, papel, texto) VALUES ($1, $2, $3)';
      await client.query(sql, [conversaId, 'user', pergunta]);
      await client.query(sql, [conversaId, 'assistant', resposta]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }
}
