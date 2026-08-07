import { formatInterval } from '../../src/domain/formatInterval';

describe('formatInterval', () => {
  test('minutos abaixo de 1 hora usam o prefixo "<" e sufixo "m"', () => {
    expect(formatInterval(1)).toBe('<1m');
    expect(formatInterval(10)).toBe('<10m');
    expect(formatInterval(45)).toBe('<45m');
  });

  test('entre 1 hora e 1 dia usa o prefixo "<" e sufixo "h"', () => {
    expect(formatInterval(60)).toBe('<1h');
    expect(formatInterval(180)).toBe('<3h');
  });

  test('a partir de 1 dia usa sufixo "d" sem prefixo', () => {
    expect(formatInterval(24 * 60)).toBe('1d');
    expect(formatInterval(4 * 24 * 60)).toBe('4d');
    expect(formatInterval(21 * 24 * 60)).toBe('21d');
  });
});
