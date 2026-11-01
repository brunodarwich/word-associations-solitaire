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

`src/content.ts` contém o vocabulário. `src/levels.ts` constrói distribuições fixas a partir de uma ordem legal de coleta, respeitando três categorias simultâneas. Cada fase inclui uma sequência testemunha; os testes reproduzem todas as sequências pelo motor público e verificam conservação das cartas. Não há alegação de solução ótima. Os limites são calculados sobre a solução testemunha com margem progressiva de 60% a 15%.

O motor puro fica em `src/engine.ts`. A persistência usa um esquema versionado e valida cartas, categorias, orçamento e histórico antes da retomada. Sons são sintetizados localmente. Fontes são carregadas pelo Google Fonts com alternativas locais.

## Publicação

GitHub Actions testa, verifica o build e publica no GitHub Pages após push para `main`. Ativar Pages com origem **GitHub Actions**. O caminho base está configurado no Vite; a navegação da aplicação não depende de rotas do servidor.

Planejamento e critérios: `tasks/plan.md` e `tasks/todo.md`.
