import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { levelProgress, dueTodayCount } from '../../src/domain/mastery';
import { StudyCardScreen } from '../../src/features/study/StudyCardScreen';
import { CURRENT_LEVEL, studyQueue } from '../../src/mocks/studyQueue';

const expectedProgress = levelProgress(studyQueue, CURRENT_LEVEL);
const expectedDueToday = dueTodayCount(studyQueue, CURRENT_LEVEL, Date.now());

describe('StudyCardScreen — História de Usuário 1 (ver e revelar)', () => {
  test('exibe a carta com a palavra oculta e o botão Revelar visível', async () => {
    await render(<StudyCardScreen />);
    const first = studyQueue[0];
    expect(screen.getByTestId('word-image')).toBeTruthy();
    expect(screen.getByTestId('sentence-target').props.children).not.toBe(first.word);
    expect(screen.getByTestId('reveal-button')).toBeTruthy();
  });

  test('revela a palavra ao tocar em Revelar e some com o botão', async () => {
    await render(<StudyCardScreen />);
    const first = studyQueue[0];
    await fireEvent.press(screen.getByTestId('reveal-button'));
    expect(screen.getByTestId('sentence-target').props.children).toBe(first.word);
    expect(screen.queryByTestId('reveal-button')).toBeNull();
  });
});

describe('StudyCardScreen — História de Usuário 2 (navegar entre cartas)', () => {
  test('avança para a próxima carta e oculta a palavra novamente', async () => {
    await render(<StudyCardScreen />);
    await fireEvent.press(screen.getByTestId('reveal-button'));
    await fireEvent.press(screen.getByTestId('next-arrow'));

    expect(screen.getByTestId('sentence-target').props.children).not.toBe(studyQueue[1].word);
    expect(screen.getByTestId('reveal-button')).toBeTruthy();
  });

  test('retrocede para a carta anterior', async () => {
    await render(<StudyCardScreen />);
    await fireEvent.press(screen.getByTestId('next-arrow'));
    await fireEvent.press(screen.getByTestId('prev-arrow'));

    expect(screen.getByTestId('sentence-target').props.children).not.toBe(studyQueue[0].word);
  });

  test('a seta esquerda está desabilitada na primeira carta', async () => {
    await render(<StudyCardScreen />);
    expect(screen.getByTestId('prev-arrow').props.accessibilityState.disabled).toBe(true);
  });

  test('a seta direita está desabilitada na última carta', async () => {
    await render(<StudyCardScreen />);
    for (let i = 0; i < studyQueue.length - 1; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await fireEvent.press(screen.getByTestId('next-arrow'));
    }
    expect(screen.getByTestId('next-arrow').props.accessibilityState.disabled).toBe(true);
  });
});

describe('StudyCardScreen — História de Usuário 1 de 003 (progresso de nível)', () => {
  test('exibe o percentual de progresso rotulado com o nível atual', async () => {
    await render(<StudyCardScreen />);
    expect(screen.getByText(`${expectedProgress}% do ${CURRENT_LEVEL}`)).toBeTruthy();
  });

  test('o progresso não muda ao navegar entre cartas', async () => {
    await render(<StudyCardScreen />);
    await fireEvent.press(screen.getByTestId('next-arrow'));
    expect(screen.getByText(`${expectedProgress}% do ${CURRENT_LEVEL}`)).toBeTruthy();
  });
});

describe('StudyCardScreen — História de Usuário 2 de 003 (badge de pendências)', () => {
  test('exibe a quantidade de cartas devidas hoje', async () => {
    await render(<StudyCardScreen />);
    expect(screen.getByText(`${expectedDueToday} hoje`)).toBeTruthy();
  });

  test('o badge de pendências é visualmente menos proeminente que o progresso de nível', async () => {
    await render(<StudyCardScreen />);
    const progressStyle = StyleSheet.flatten(screen.getByTestId('level-progress').props.style);
    const badgeStyle = StyleSheet.flatten(screen.getByTestId('due-today-badge').props.style);
    expect(badgeStyle.fontSize).toBeLessThan(progressStyle.fontSize);
  });
});
