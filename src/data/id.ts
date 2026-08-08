/** Gerador de id simples para linhas locais (sem dependência de uuid). */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
