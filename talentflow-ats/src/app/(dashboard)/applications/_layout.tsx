import { Stack } from 'expo-router';

export default function ApplicationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Applications', headerShown: false }} />
      <Stack.Screen name="[applicationId]" options={{ title: 'Screening', headerShown: false }} />
    </Stack>
  );
}
