import type { ViewStyle } from 'react-native';

/** Sombra suave e flutuante, colorida com o tom do próprio botão. */
export function glossyShadowStyle(color: string): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  };
}
