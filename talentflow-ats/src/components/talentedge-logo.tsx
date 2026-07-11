import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

export function TalentEdgeLogo() {
  return (
    <View style={styles.coinContainer}>
      {/* Outer coin edge */}
      <View style={styles.coinOuter}>
        {/* Middle ring */}
        <View style={styles.coinMiddle}>
          {/* Inner coin */}
          <View style={styles.coinInner}>
            {/* Embossed TE text */}
            <ThemedText style={styles.logoText}>TE</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coinContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#b8860b',
    justifyContent: 'center',
    alignItems: 'center',
    // Add shiny effect with shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#8b6914',
  },
  coinMiddle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#daa520',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b8860b',
  },
  coinInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#c9a961',
    justifyContent: 'center',
    alignItems: 'center',
    // Inner shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  logoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5a4a20',
    letterSpacing: 0.5,
  },
});
