// Aponta o webhook do WABA para a URL do túnel (override_callback_uri) e
// confere com um GET.
// Uso: npm run meta:url -- https://xxxx.trycloudflare.com
import { chamarGraph, exigirEnv, urlSubscribedApps } from "./meta-comum.mjs";

const base = process.argv[2]?.trim().replace(/\/+$/, "");
if (!base || !/^https:\/\//.test(base)) {
  console.error("Uso: npm run meta:url -- https://<url-do-tunel>");
  process.exit(1);
}

const { WHATSAPP_VERIFY_TOKEN } = exigirEnv("WHATSAPP_VERIFY_TOKEN");
const url = urlSubscribedApps();

const ok = await chamarGraph("POST", url, {
  override_callback_uri: `${base}/webhook/whatsapp`,
  verify_token: WHATSAPP_VERIFY_TOKEN,
});
console.log("\nConferência:");
await chamarGraph("GET", url);

if (!ok) process.exit(1);
