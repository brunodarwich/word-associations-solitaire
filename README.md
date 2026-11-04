# Paciência das Palavras

Um jogo de associação de palavras em português brasileiro, com cartas de paciência e 30 fases originais para jogar no navegador.

**Jogar:** https://brunodarwich.github.io/word-associations-solitaire/

## Desenvolvimento

Requer Node.js 22.12+ ou 24.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado pelo Vite, sob `/word-associations-solitaire/`.

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Como jogar

Abra uma categoria levando sua carta de coroa a um dos três espaços de coleta. Reúna suas quatro palavras para completar o grupo. Entre colunas, somente cartas da mesma categoria podem se sobrepor; colunas vazias aceitam qualquer carta. Selecione uma carta exposta e toda a sequência abaixo dela, quando todas forem da mesma categoria, para mover a pilha inteira. Do descarte, somente o topo pode se mover. Comprar, reciclar e mover uma carta ou pilha custam uma jogada. Desfazer restaura a operação inteira. Revelar cartas e tentativas inválidas não custam.

Cada tentativa tem três dicas e três desfazeres. Reiniciar restaura a distribuição original. Conclua todos os grupos dentro do limite; a vitória tem prioridade na última jogada. Toque ou clique na carta e no destino, use Tab + Enter, ou arraste com dedo, mouse ou caneta. O arraste destaca destinos válidos; soltar fora deles ou cancelar não custa jogadas. No celular e tablet, as colunas podem rolar enquanto categorias, monte e ações permanecem visíveis.

Uma estrela pela vitória, outra por não usar dicas e outra por não desfazer. O melhor resultado é preservado. O progresso fica apenas no navegador, sem contas ou dados enviados a um servidor.

## Distribuições verificadas

As mesas crescem a cada capítulo. As contagens incluem as cartas de categoria.

| Fases | Grupos | Cartas | Cartas por pilha inicial |
| ----- | ------ | ------ | ------------------------ |
| 1–5   | 5      | 25     | 4                        |
| 6–10  | 7      | 35     | 6                        |
| 11–15 | 8      | 40     | 7                        |
| 16–20 | 9      | 45     | 8                        |
| 21–25 | 10     | 50     | 9                        |
| 26–30 | 12     | 60     | 10                       |

Cada pilha começa com apenas o topo exposto. O monte mantém entre 5 e 10 cartas. `src/campaign.ts` combina grupos de temas relacionados do vocabulário, evitando palavras e categorias repetidas na mesma mesa.

`src/content.ts` contém o vocabulário: categorias cotidianas nas primeiras fases, termos mais específicos nas intermediárias e associações por contexto e múltiplos sentidos no final. Cada grupo tem quatro palavras, sem repetições na mesma fase.

`src/levels.ts` constrói distribuições fixas a partir de uma ordem legal de coleta, respeitando três categorias simultâneas. O embaralhamento Fisher–Yates varia a ordem das categorias e das palavras dentro de cada grupo. A coleta intercala categorias e a distribuição favorece vizinhos de grupos diferentes, ponderando o espaço restante de cada coluna e do monte. A semente fixa permite reiniciar a mesma distribuição e retomar partidas salvas. Cada fase inclui uma sequência testemunha; os testes reproduzem todas as sequências pelo motor público, verificam conservação das cartas e medem a mistura entre categorias. Não há alegação de solução ótima. Os limites são calculados sobre a solução testemunha com margem progressiva de 60% a 15%.

O motor puro fica em `src/engine.ts`. A persistência usa um esquema versionado e valida cartas, categorias, orçamento e histórico antes da retomada. Sons são sintetizados localmente. Fontes são carregadas pelo Google Fonts com alternativas locais.

Os saves da versão 1 são validados contra a campanha anterior e migrados para a versão 2. A fase em andamento começa na nova mesa ampliada; estrelas, fases liberadas e preferências são preservadas. A chave de armazenamento continua a mesma para permitir essa atualização automática.

## Publicação

GitHub Actions testa, verifica o build e publica no GitHub Pages após push para `main`. Ativar Pages com origem **GitHub Actions**. O caminho base está configurado no Vite; a navegação da aplicação não depende de rotas do servidor.

Planejamento e critérios: `tasks/plan.md` e `tasks/todo.md`.
