import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="categories" options={{ title: 'Categorias' }} />
      <Tabs.Screen name="create" options={{ title: 'Criar' }} />
      <Tabs.Screen name="review" options={{ title: 'Revisar' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progresso' }} />
    </Tabs>
  );
}