import { fireEvent, render, screen } from '@testing-library/react-native';
import { StudyCardScreen } from '../../src/features/study/StudyCardScreen';
import { studyQueue } from '../../src/mocks/studyQueue';

describe('StudyCardScreen — História de Usuário 1 (ver e revelar)', () => {
  test('exibe a contagem de cartas restantes ao abrir a tela', async () => {
    await render(<StudyCardScreen />);
    expect(screen.getByText(`${studyQueue.length} cartas restantes`)).toBeTruthy();
  });

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

    expect(screen.getByText(`${studyQueue.length - 1} cartas restantes`)).toBeTruthy();
    expect(screen.getByTestId('sentence-target').props.children).not.toBe(studyQueue[1].word);
    expect(screen.getByTestId('reveal-button')).toBeTruthy();
  });

  test('retrocede para a carta anterior', async () => {
    await render(<StudyCardScreen />);
    await fireEvent.press(screen.getByTestId('next-arrow'));
    await fireEvent.press(screen.getByTestId('prev-arrow'));

    expect(screen.getByText(`${studyQueue.length} cartas restantes`)).toBeTruthy();
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
