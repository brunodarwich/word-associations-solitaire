# Refinamento da interface — 2026-11-01

Referências: telas existentes de início, campanha e mesa, inspecionadas no navegador. Preservar a identidade editorial em verde, creme e dourado. Não há referência externa fornecida; assumir continuidade do sistema existente.

Contrato de design:

- Início: comunicar associação de palavras e priorizar começar ou continuar. Composição de cartas com proporções estáveis, sem ultrapassar a tela.
- Campanha: evidenciar a próxima fase, distinguir bloqueio com ícone e mostrar progresso global.
- Mesa: priorizar leitura e seleção das cartas. Feedback junto ao tabuleiro, seleção com marca e opção de cancelar, progresso de categorias e controles acessíveis por toque e teclado.
- Celular: ação inicial em largura total, alvos de pelo menos 44 px na navegação e barra de ações acessível durante rolagem. Tutorial expansível para preservar espaço de jogo.
- Tablet: composição em duas colunas no início, três colunas na campanha, mesa sem painel lateral até 1050 px.
- Motion: entrada breve, revelação de cartas, resposta de seleção e hover; respeitar preferência do sistema e configuração de redução de movimentos. Evitar movimento contínuo e dependências adicionais.
- Rejeitar: rolagem horizontal, texto cortado, mudanças nas regras, dependência de hover para jogar e cores como único indicador de seleção.

Verificação: 320, 768, 1024 e 1440 px; início, campanha e fases avançadas; axe WCAG AA; teclado, toque, arraste, persistência e solução das 30 fases. Publicação pelo workflow GitHub Pages existente.
