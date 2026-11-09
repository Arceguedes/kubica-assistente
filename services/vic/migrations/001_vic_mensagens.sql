-- Histórico das conversas da VIC. Pode rodar mais de uma vez sem efeito colateral.
CREATE TABLE IF NOT EXISTS vic_mensagens (
  id          BIGSERIAL PRIMARY KEY,
  conversa_id UUID        NOT NULL,
  papel       TEXT        NOT NULL CHECK (papel IN ('user', 'assistant')),
  texto       TEXT        NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS vic_mensagens_conversa_idx
  ON vic_mensagens (conversa_id, criado_em, id);
