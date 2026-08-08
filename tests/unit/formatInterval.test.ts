import { formatInterval, formatIntervalLong } from '../../src/domain/formatInterval';

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

describe('formatIntervalLong', () => {
  test('minutos: singular e plural', () => {
    expect(formatIntervalLong(1)).toBe('1 minuto');
    expect(formatIntervalLong(10)).toBe('10 minutos');
  });

  test('horas: singular e plural', () => {
    expect(formatIntervalLong(60)).toBe('1 hora');
    expect(formatIntervalLong(180)).toBe('3 horas');
  });

  test('dias: singular e plural', () => {
    expect(formatIntervalLong(24 * 60)).toBe('1 dia');
    expect(formatIntervalLong(78 * 24 * 60)).toBe('78 dias');
  });
});
