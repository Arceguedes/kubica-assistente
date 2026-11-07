// Hook PreToolUse (Bash): impede que comandos citem o arquivo .env.
// Lê o JSON do stdin; sai com 2 (bloqueia) se o comando citar .env ou .env.*
// (exceto .env.example). Caso contrário, sai com 0.

let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (parte) => (entrada += parte));
process.stdin.on("end", () => {
  let comando = "";
  try {
    comando = String(JSON.parse(entrada)?.tool_input?.command ?? "");
  } catch {
    process.exit(0);
  }

  // ".env" ou ".env.algo" como nome de arquivo, delimitado por início,
  // espaço, barra, aspas ou operadores de shell.
  const padrao =
    /(?:^|[\s/\\"'=<>|;&(])\.env(?:\.([\w.-]+))?(?=$|[\s/\\"'|;&<>)])/g;

  for (const achado of comando.matchAll(padrao)) {
    if (achado[1] !== "example") {
      console.error(
        "Bloqueado: o .env não pode ser lido pelo Claude Code. Use o .env.example.",
      );
      process.exit(2);
    }
  }
  process.exit(0);
});
