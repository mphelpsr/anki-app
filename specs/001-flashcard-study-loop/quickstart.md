# Guia Rápido: Validar o Loop de Estudo com Flashcards (MVP)

Pré-requisitos: Node 22+, uma forma de rodar o Expo (app Expo Go em um
dispositivo/simulador, ou `--web` para uma verificação rápida).

## 1. Instalar e rodar

```bash
npm install
npx expo start
```

Abra em um simulador/dispositivo ou pressione `w` para a prévia web.

## 2. Gerar/atualizar o conteúdo semente (opcional — uma amostra já vem por padrão)

```bash
npm run content:ingest
# grava src/content/seed/*.json conforme contracts/seed-content-schema.json
```

Até que `content-pipeline/SOURCES.md` confirme os termos de licença da
Oxford, isso produz o pequeno dataset de amostra, não o Oxford 3000/5000
completo — ver
[research.md](./research.md#pipeline-de-ingestão-de-conteúdo).

## 3. Validar a História de Usuário 2 (lista de decks + contagem de devidos)

1. Abra o app. A tela inicial (lista de decks) DEVE mostrar ao menos um
   deck com contagem de devidos maior que zero (instalação nova ⇒ todos
   os cards semeados estão devidos).
2. Confirme que a contagem de devidos corresponde ao número de cards no
   arquivo de amostra semeado para aquele deck.

## 4. Validar a História de Usuário 1 (sessão de estudo)

1. Toque em um deck com cards devidos. A tela de estudo DEVE mostrar
   apenas a `front` do primeiro card.
2. Revele a resposta. O `back` DEVE aparecer junto com 4 botões de nota.
3. Avalie o card. O próximo card devido DEVE aparecer imediatamente, e o
   card avaliado NÃO DEVE reaparecer mais tarde na mesma sessão.
4. Avalie todos os cards devidos restantes. A tela DEVE mostrar um estado
   claro de "sessão concluída", e a contagem de devidos daquele deck na
   lista de decks DEVE agora mostrar 0.

## 5. Validar a História de Usuário 3 (agendamento)

1. Avalie um card novo como "não lembrei" (nota 0). Inspecione seu
   `nextDueAt` armazenado (via `tests/unit/scheduler.test.ts` ou um log
   de depuração) — DEVE estar dentro do mesmo dia.
2. Avalie um card novo diferente como "lembrei facilmente" (nota 3). Seu
   `nextDueAt` DEVE ser posterior ao do card de nota 0.
3. Reabra o mesmo deck no dia seguinte (ou avance o relógio do
   dispositivo) e avalie o card de nota 3 como "lembrei" ou "lembrei
   facilmente" mais três vezes seguidas. Seu `intervalDays` DEVE crescer
   estritamente a cada vez — confirma o SC-004.

## 6. Verificação automatizada

```bash
npm test                 # unitários + integração (Jest)
npm test -- scheduler    # apenas o contrato do agendador (rápido, sem BD)
```

`tests/unit/scheduler.test.ts` DEVE passar antes de qualquer trabalho de
UI ser considerado concluído, conforme o Princípio III da Constituição
(testes primeiro para lógica de domínio).

## 7. Verificação offline (Princípio I da Constituição / SC-005)

Coloque o dispositivo/simulador em modo avião e repita os passos 3-5.
Todos os passos DEVEM funcionar de forma idêntica sem conexão de rede.
