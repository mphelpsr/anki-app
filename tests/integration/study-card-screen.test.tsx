import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { levelProgress, dueTodayCount } from '../../src/domain/mastery';
import { StudyCardScreen } from '../../src/features/study/StudyCardScreen';
import { CURRENT_LEVEL, studyQueue } from '../../src/mocks/studyQueue';

const expectedProgress = levelProgress(studyQueue, CURRENT_LEVEL);
const expectedDueToday = dueTodayCount(studyQueue, CURRENT_LEVEL, Date.now());

/** Sem feedback pós-avaliação (duração 0) para testes que não o cobrem diretamente. */
function renderScreen() {
  return render(<StudyCardScreen feedbackDurationMs={0} />);
}

describe('StudyCardScreen — História de Usuário 1 de 002 (ver a frase completa)', () => {
  test('exibe a frase completa com a palavra-alvo em destaque e o botão Reveal visível', async () => {
    await renderScreen();
    const first = studyQueue[0];
    expect(screen.getByTestId('word-image')).toBeTruthy();
    expect(screen.getByTestId('sentence-target').props.children).toBe(first.word);
    expect(screen.getByTestId('reveal-button')).toBeTruthy();
    expect(screen.queryByTestId('translation-line')).toBeNull();
  });

  test('tocar em Reveal não altera a frase em inglês, que permanece como referência', async () => {
    await renderScreen();
    const first = studyQueue[0];
    await fireEvent.press(screen.getByTestId('reveal-button'));
    expect(screen.getByTestId('sentence-target').props.children).toBe(first.word);
    expect(screen.queryByTestId('reveal-button')).toBeNull();
  });
});

describe('StudyCardScreen — História de Usuário 2 de 002 (navegar entre cartas)', () => {
  test('avança para a próxima carta e mostra a nova palavra em destaque', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId('reveal-button'));
    await fireEvent.press(screen.getByTestId('next-arrow'));

    expect(screen.getByTestId('sentence-target').props.children).toBe(studyQueue[1].word);
    expect(screen.getByTestId('reveal-button')).toBeTruthy();
  });

  test('retrocede para a carta anterior', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId('next-arrow'));
    await fireEvent.press(screen.getByTestId('prev-arrow'));

    expect(screen.getByTestId('sentence-target').props.children).toBe(studyQueue[0].word);
  });

  test('a seta esquerda está desabilitada na primeira carta', async () => {
    await renderScreen();
    expect(screen.getByTestId('prev-arrow').props.accessibilityState.disabled).toBe(true);
  });

  test('a seta direita está desabilitada na última carta', async () => {
    await renderScreen();
    for (let i = 0; i < studyQueue.length - 1; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await fireEvent.press(screen.getByTestId('next-arrow'));
    }
    expect(screen.getByTestId('next-arrow').props.accessibilityState.disabled).toBe(true);
  });
});

describe('StudyCardScreen — História de Usuário 1 de 003 (progresso de nível)', () => {
  test('exibe o percentual de progresso rotulado com o nível atual', async () => {
    await renderScreen();
    expect(screen.getByText(`${expectedProgress}% do ${CURRENT_LEVEL}`)).toBeTruthy();
  });

  test('o progresso não muda ao navegar entre cartas', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId('next-arrow'));
    expect(screen.getByText(`${expectedProgress}% do ${CURRENT_LEVEL}`)).toBeTruthy();
  });
});

describe('StudyCardScreen — História de Usuário 2 de 003 (badge de pendências)', () => {
  test('exibe a quantidade de cartas devidas hoje', async () => {
    await renderScreen();
    expect(screen.getByText(`${expectedDueToday} hoje`)).toBeTruthy();
  });

  test('o badge de pendências é visualmente menos proeminente que o progresso de nível', async () => {
    await renderScreen();
    const progressStyle = StyleSheet.flatten(screen.getByTestId('level-progress').props.style);
    const badgeStyle = StyleSheet.flatten(screen.getByTestId('due-today-badge').props.style);
    expect(badgeStyle.fontSize).toBeLessThan(progressStyle.fontSize);
  });
});

describe('StudyCardScreen — História de Usuário 1 de 004 (avaliação com tempo real)', () => {
  test('os 4 botões de avaliação aparecem no lugar de Reveal', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId('reveal-button'));

    expect(screen.queryByTestId('reveal-button')).toBeNull();
    expect(screen.getByTestId('grade-again')).toBeTruthy();
    expect(screen.getByTestId('grade-hard')).toBeTruthy();
    expect(screen.getByTestId('grade-good')).toBeTruthy();
    expect(screen.getByTestId('grade-easy')).toBeTruthy();
  });

  test('avaliar avança para a próxima carta, já com a nova palavra em destaque', async () => {
    await renderScreen();
    await fireEvent.press(screen.getByTestId('reveal-button'));
    await fireEvent.press(screen.getByTestId('grade-good'));

    await waitFor(() => {
      expect(screen.getByTestId('sentence-target').props.children).toBe(studyQueue[1].word);
    });
    expect(screen.getByTestId('reveal-button')).toBeTruthy();
    expect(screen.queryByTestId('translation-line')).toBeNull();
  });

  test('avaliar a última carta encerra a sessão', async () => {
    await renderScreen();
    for (let i = 0; i < studyQueue.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await fireEvent.press(screen.getByTestId('reveal-button'));
      // eslint-disable-next-line no-await-in-loop
      await fireEvent.press(screen.getByTestId('grade-good'));
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => {
        expect(screen.queryByTestId('grade-feedback')).toBeNull();
      });
    }

    expect(screen.getByTestId('session-complete')).toBeTruthy();
  });
});

describe('StudyCardScreen — História de Usuário 2 de 004 (tradução ao revelar)', () => {
  test('a tradução em português aparece junto da revelação', async () => {
    await renderScreen();
    const first = studyQueue[0];
    await fireEvent.press(screen.getByTestId('reveal-button'));

    const translation = screen.getByTestId('translation-line');
    expect(translation.props.children[1].props.children).toBe(first.translatedWord);
  });
});

describe('StudyCardScreen — História de Usuário 3 de 004 (feedback colorido ao avaliar)', () => {
  test('exibe o estado de carregamento com a cor e o rótulo da nota escolhida', async () => {
    await render(<StudyCardScreen feedbackDurationMs={50} />);
    await fireEvent.press(screen.getByTestId('reveal-button'));
    await fireEvent.press(screen.getByTestId('grade-hard'));

    const feedback = screen.getByTestId('grade-feedback');
    expect(feedback).toBeTruthy();
    expect(StyleSheet.flatten(feedback.props.style).backgroundColor).toBe('#eb5757');
    expect(screen.getByText('Hard')).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByTestId('grade-feedback')).toBeNull();
    });
  });

  test('some com o feedback e mostra a próxima carta ao final do intervalo', async () => {
    await render(<StudyCardScreen feedbackDurationMs={50} />);
    await fireEvent.press(screen.getByTestId('reveal-button'));
    await fireEvent.press(screen.getByTestId('grade-good'));

    await waitFor(() => {
      expect(screen.getByTestId('sentence-target').props.children).toBe(studyQueue[1].word);
    });
  });
});
