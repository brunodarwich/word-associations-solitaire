# Paciência das Palavras — plano de implementação

## Melhoria aprovada: mesa compacta e pilhas

Toque ou teclado seleciona uma sequência exposta da mesma categoria até o fim da coluna. Arraste por Pointer Events (limiar 8 px) move a sequência atomicamente, custa uma jogada e desfaz em uma operação. Colunas preservam ordem; coleta normaliza título primeiro. Nenhuma alteração no formato salvo, nas distribuições ou nos limites.

Abertura compacta com informações complementares em Sobre o jogo. Mesa dimensionada pela altura dinâmica, categorias/monte/ações fora da rolagem das colunas; orientação horizontal usa lateral. Priorizar leitura, alvos de 44 px, redução de movimentos e acesso com zoom. Validar toque real, cancelamento, rolagem automática, teclado, integridade das cartas e campanha. Publicar pelo workflow Pages existente após testes.

Plano aprovado: jogo estático React/TypeScript/Vite em PT-BR, 30 fases para adultos, três espaços de coleta, quatro palavras por categoria, cartas ocultas, monte e descarte, limite de jogadas, três dicas e três desfazeres por tentativa. Vitória tem prioridade na última jogada. Reiniciar restaura a distribuição. Sem backend, cadastro ou anúncios.

## Design

Mesa verde profundo, cartas marfim, detalhes dourados, títulos em serifa e controles legíveis. Tela inicial apresenta o jogo e continuar; mesa prioriza cartas e destinos. Celular mantém colunas lado a lado, com texto quebrado e rolagem vertical. Teclado e toque equivalem ao arraste. Cartas ocultas não revelam conteúdo acessível.

## Arquitetura

Motor puro separado da interface. Conteúdo com IDs estáveis, distribuição determinística e sequência testemunha que comprova solução. Construir distribuições a partir de uma sequência legal de abertura/conclusão de grupos e distribuir essa sequência entre pilhas preservando sua ordem. Limites: teto da solução vezes 1,60 / 1,45 / 1,35 / 1,25 / 1,20 / 1,15 por bloco de cinco fases. Salvar versão, partida, histórico, estrelas e preferências em localStorage com validação estrutural e de integridade.

## Conteúdo

30 temas conforme o plano aprovado na conversa, registrados integralmente em src/content.ts. Fase 22 usa Formas do verbo: infinitivo, gerúndio, particípio, forma finita. Revisar duplicações e associações ambíguas por fase.

## Verificação

Vitest para regras, orçamento, conservação de cartas, testemunhas das 30 fases e persistência. Playwright para jogar pelo DOM, vitória, progresso, responsividade, teclado e acessibilidade. Build TypeScript/Vite. Conferir a versão publicada e os recursos sob o caminho base.

## Publicação

Criar repositório público brunodarwich/word-associations-solitaire após verificar que não existe; GitHub Actions executa testes, build e publica Pages. URL esperada https://brunodarwich.github.io/word-associations-solitaire/. Sem sobrescrever trabalho remoto existente.
