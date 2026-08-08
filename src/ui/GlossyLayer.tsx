import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { lightenColor } from './glossyColor';

interface Props {
  color: string;
}

/**
 * Camadas puramente visuais do estilo "3D glossy" (ícone de app flutuante,
 * gradiente + brilho superior) pedido para os botões do app. Usado como
 * primeiros filhos de um `Pressable`/`View` com `overflow: 'hidden'` — não
 * intercepta toques, só desenha atrás do conteúdo real do botão.
 */
export function GlossyLayer({ color }: Props) {
  return (
    <>
      <LinearGradient colors={[lightenColor(color, 0.35), color]} style={styles.fill} pointerEvents="none" />
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
        style={styles.highlight}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
});
