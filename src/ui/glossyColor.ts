/** Clareia uma cor hex em direção ao branco (0 = sem mudança, 1 = branco). */
export function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const channel = (shift: number) => {
    const value = (num >> shift) & 0xff;
    return Math.min(255, Math.round(value + (255 - value) * amount));
  };
  const [r, g, b] = [channel(16), channel(8), channel(0)];
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
