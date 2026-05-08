import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="categories" options={{ title: 'Categorias' }} />
      <Tabs.Screen name="create" options={{ title: 'Criar' }} />
      <Tabs.Screen name="review" options={{ title: 'Revisar' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progresso' }} />
    </Tabs>
  );
}
