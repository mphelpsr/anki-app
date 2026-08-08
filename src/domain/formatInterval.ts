const HOUR_MINUTES = 60;
const DAY_MINUTES = 24 * HOUR_MINUTES;

/**
 * Formata um intervalo em minutos como rótulo curto para os botões de
 * avaliação. Abaixo de 1 dia usa "<" (aproximado, curto prazo); a
 * partir de 1 dia usa o valor exato em dias.
 */
export function formatInterval(minutes: number): string {
  if (minutes < HOUR_MINUTES) {
    return `<${Math.ceil(minutes)}m`;
  }
  if (minutes < DAY_MINUTES) {
    return `<${Math.ceil(minutes / HOUR_MINUTES)}h`;
  }
  return `${Math.round(minutes / DAY_MINUTES)}d`;
}

/**
 * Formata um intervalo em minutos por extenso, em português, para o
 * feedback pós-avaliação (ex.: "10 minutos", "78 dias").
 */
export function formatIntervalLong(minutes: number): string {
  if (minutes < HOUR_MINUTES) {
    const value = Math.ceil(minutes);
    return `${value} ${pluralize(value, 'minuto', 'minutos')}`;
  }
  if (minutes < DAY_MINUTES) {
    const value = Math.ceil(minutes / HOUR_MINUTES);
    return `${value} ${pluralize(value, 'hora', 'horas')}`;
  }
  const value = Math.round(minutes / DAY_MINUTES);
  return `${value} ${pluralize(value, 'dia', 'dias')}`;
}

function pluralize(value: number, singular: string, plural: string): string {
  return value === 1 ? singular : plural;
}
