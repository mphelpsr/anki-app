# Backlog de Ideias Futuras

Ideias de produto capturadas em conversa, deliberadamente **não** transformadas
em `spec.md` ainda. Ficam aqui até serem priorizadas e passarem pelo fluxo
normal (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` →
`/speckit-implement`). Este arquivo não é uma spec e não tem força de
requisito.

## Treino a partir de transcrição de vídeo

**Esboço**: o aprendiz fornece um trecho/link (ex.: YouTube) ou o texto de
uma transcrição. O app:

1. Classifica o nível CEFR do texto.
2. Mostra a quantidade de frases/palavras que o conteúdo possui.
3. Confronta esse vocabulário com o que o aprendiz já conhece (ver o
   conceito de "palavra dominada" da feature
   [`003-cefr-progress-counter`](./003-cefr-progress-counter/spec.md)).
4. Estima em quanto tempo o aprendiz teria conhecimento suficiente do
   vocabulário daquele conteúdo para treinar com ele.

**Por que não é feature ainda:**

- **Sequenciamento (Princípio V da constituição)**: é literalmente "múltipla
  fonte de conteúdo", explicitamente adiada até o loop do MVP (Oxford-only)
  estar implementado e validado com `001-flashcard-study-loop`.
- **Tensão com offline-first (Princípio I)**: classificar CEFR de um texto
  arbitrário com qualidade real provavelmente exige uma chamada de rede
  (LLM/API) — uma heurística 100% offline (frequência de palavras contra as
  listas Oxford por nível) é mais simples mas mais grosseira. Se avançar,
  isso deve ser uma exceção documentada e pontual (só na ação de importar
  conteúdo), não um enfraquecimento silencioso do princípio.
- **Dependência de produto**: o "motor" de gap de vocabulário (quais
  palavras o aprendiz já domina) é o mesmo modelo que a feature 003 está
  construindo — faz sentido essa feature vir depois, reaproveitando-o.

**Próximo passo, quando for priorizada**: `/speckit-specify` descrevendo o
fluxo de importação, a fonte da classificação CEFR (heurística local vs.
serviço externo) e o formato da estimativa de tempo — como uma feature
própria, não um adendo a nenhuma das existentes.
