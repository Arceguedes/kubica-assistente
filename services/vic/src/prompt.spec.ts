import { FRASE_EQUIPE, FRASE_PASSAGEM_HEX, SYSTEM_PROMPT } from './prompt.js';

describe('SYSTEM_PROMPT', () => {
  it('tem as quatro seções, nesta ordem', () => {
    const posicoes = ['# Papel', '# Personalidade', '# Regras', '# Formato'].map(
      (titulo) => SYSTEM_PROMPT.indexOf(titulo),
    );

    expect(posicoes.every((p) => p >= 0)).toBe(true);
    expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b));
  });

  it('contém exatamente as frases de passagem', () => {
    expect(SYSTEM_PROMPT).toContain(FRASE_PASSAGEM_HEX);
    expect(SYSTEM_PROMPT).toContain(FRASE_EQUIPE);
  });

  it('não contém número de telefone brasileiro', () => {
    const telefone = /(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/;

    expect(SYSTEM_PROMPT).not.toMatch(telefone);
  });
});
