// Inscreve o app no WABA (POST subscribed_apps) e confere com um GET.
// Uso: npm run meta:assinar
import { chamarGraph, urlSubscribedApps } from "./meta-comum.mjs";

const url = urlSubscribedApps();

const ok = await chamarGraph("POST", url);
console.log("\nConferência:");
await chamarGraph("GET", url);

if (!ok) process.exit(1);
