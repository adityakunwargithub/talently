import { Stack } from 'expo-router';

export default function CareersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Careers' }} />
      <Stack.Screen name="[jobId]" options={{ title: 'Job details' }} />
    </Stack>
  );
}
