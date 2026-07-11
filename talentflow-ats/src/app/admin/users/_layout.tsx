import { Stack } from 'expo-router';

export default function AdminUsersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Users' }} />
      <Stack.Screen name="[type]/[id]" options={{ title: 'Edit user' }} />
    </Stack>
  );
}
