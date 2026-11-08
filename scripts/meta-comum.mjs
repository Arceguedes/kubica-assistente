// Funções comuns aos scripts meta:*. Lê só process.env (carregado com
// node --env-file) e nunca imprime o token.

export function exigirEnv(...nomes) {
  const faltando = nomes.filter((nome) => !process.env[nome]);
  if (faltando.length) {
    console.error(`Faltam variáveis no .env: ${faltando.join(", ")}`);
    process.exit(1);
  }
  return Object.fromEntries(nomes.map((nome) => [nome, process.env[nome]]));
}

export function urlSubscribedApps() {
  const { WHATSAPP_API_VERSION, WHATSAPP_WABA_ID } = exigirEnv(
    "WHATSAPP_API_VERSION",
    "WHATSAPP_WABA_ID",
  );
  return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_WABA_ID}/subscribed_apps`;
}

function semSegredos(texto) {
  let limpo = texto;
  for (const nome of ["WHATSAPP_TOKEN", "WHATSAPP_VERIFY_TOKEN"]) {
    const valor = process.env[nome];
    if (valor) limpo = limpo.split(valor).join(`<${nome}>`);
  }
  return limpo;
}

export async function chamarGraph(metodo, url, corpo) {
  const { WHATSAPP_TOKEN } = exigirEnv("WHATSAPP_TOKEN");
  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      ...(corpo ? { "Content-Type": "application/json" } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const texto = await resposta.text();
  let conteudo;
  try {
    conteudo = JSON.stringify(JSON.parse(texto), null, 2);
  } catch {
    conteudo = texto;
  }

  console.log(`${metodo} ${url} -> ${resposta.status}`);
  console.log(semSegredos(conteudo));
  return resposta.ok;
}
