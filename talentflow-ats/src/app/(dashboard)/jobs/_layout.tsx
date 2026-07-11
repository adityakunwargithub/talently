import { Stack } from 'expo-router';

export default function JobsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Jobs' }} />
      <Stack.Screen name="new" options={{ title: 'New job' }} />
      <Stack.Screen name="[jobId]" options={{ title: 'Edit job' }} />
    </Stack>
  );
}
