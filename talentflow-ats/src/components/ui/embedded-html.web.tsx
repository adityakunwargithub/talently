import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

/**
 * react-native-webview has no web implementation, so on web we render a real
 * sandboxed <iframe> directly (this file only loads on the web platform).
 */
export function EmbeddedHtml({ html, style }: { html: string; style?: StyleProp<ViewStyle> }) {
  return (
    <iframe
      srcDoc={html}
      sandbox=""
      style={{ border: 'none', width: '100%', height: '100%', ...(StyleSheet.flatten(style) as object) }}
    />
  );
}
