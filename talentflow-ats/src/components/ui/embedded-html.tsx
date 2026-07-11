import { WebView } from 'react-native-webview';
import { StyleProp, ViewStyle } from 'react-native';

export function EmbeddedHtml({ html, style }: { html: string; style?: StyleProp<ViewStyle> }) {
  return <WebView originWhitelist={['*']} source={{ html }} style={style} />;
}
