# Tarefas

## Mesa compacta e pilhas — implementação aprovada

- [x] 1. Registrar decisões e dependências. Aceite: plano e critérios preservados. Verificação: revisão dos documentos. Dependências: nenhuma.
- [x] 2. Motor de pilhas. Aceite: movimento atômico, custo único e desfazer; rejeitar sequências inválidas. Verificação: testes de regras, integridade e persistência. Dependências: 1.
- [x] 3. Seleção de pilhas. Aceite: toque/teclado selecionam toda a sequência e destinos usam a validação do motor. Verificação: testes da interface. Dependências: 2.
- [x] Checkpoint: regras e seleção verificadas, build aprovado.
- [x] 4. Arraste por ponteiro. Aceite: pilha acompanha dedo, destinos destacados, cancelamento sem custo e rolagem nas bordas. Verificação: eventos reais de toque, mouse e cancelamento. Dependências: 3.
- [x] 5. Mesa compacta. Aceite: controles essenciais visíveis em 320×640, tablet e paisagem, somente colunas rolam quando necessário. Verificação: dimensões, títulos longos, zoom e screenshots. Dependências: 3.
- [x] Checkpoint: toque, teclado, acessibilidade e tamanhos aprovados.
- [ ] 6. Publicar. Aceite: testes, build, pipeline e smoke público aprovados. Verificação: Vitest, Playwright, GitHub Actions e URL pública. Dependências: 4, 5.

Cada item tem escopo S/M (até aproximadamente cinco arquivos). Comandos de verificação: npm test, npm run build e npm run test:e2e.

- [x] 1. Base navegável. Aceite: título e layout responsivo; verificar build e navegador. Dependências: nenhuma.
- [x] 2. Primeira fase completa. Aceite: abertura, associação e vitória; verificar solução no motor. Depende: 1.
- [x] 3. Monte e orçamento. Aceite: ordem correta, custos e vitória na última jogada; verificar testes. Depende: 2.
- [x] Checkpoint 1: uma partida vencível, testes e build aprovados.
- [x] 4. Recuperação. Aceite: dicas, desfazer e reinício preservam integridade; verificar limites e restauração. Depende: 3.
- [x] 5. Fases 1–10. Aceite: conteúdo e tutorial disponíveis; verificar dez soluções. Depende: 4.
- [x] 6. Fases 11–20. Aceite: conteúdo e dificuldade crescente; verificar dez soluções. Depende: 5.
- [x] Checkpoint 2: vinte fases verificadas e revisão editorial.
- [x] 7. Fases 21–30. Aceite: conteúdo avançado revisado; verificar dez soluções. Depende: 6.
- [x] 8. Campanha persistente. Aceite: desbloqueio, estrelas e retomada; verificar recarga e dados inválidos. Depende: 7.
- [x] 9. Interação acessível. Aceite: toque, arraste e teclado equivalentes; verificar 360 px, foco e acessibilidade. Depende: 8.
- [x] Checkpoint 3: trinta fases, testes e build aprovados.
- [x] 10. Publicação. Aceite: GitHub e Pages ativos; verificar URL, recarga e recursos. Depende: 9.

## Evidências de conclusão

- 12 testes de regras e persistência aprovados; as 30 soluções foram reproduzidas com conservação de cartas.
- Pipeline de produção: https://github.com/brunodarwich/word-associations-solitaire/actions/runs/41349716432 — testes, build e deploy aprovados.
- Campanha completa executada pelos controles no CI; auditorias de início, campanha e mesa sem violações WCAG A/AA nos cenários verificados.
- Site publicado: https://brunodarwich.github.io/word-associations-solitaire/
- Três testes adicionais no site publicado aprovados: vitória/desbloqueio/recarga, teclado/dicas/desfazer/configurações e arraste.
