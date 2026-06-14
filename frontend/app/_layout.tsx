import { Stack } from 'expo-router';
import { AppProvider } from '../src/context/AppContext';
import AuthContextProvider from '../src/context/AuthContext';


export default function RootLayout() {
  return (
    <AuthContextProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppProvider>
    </AuthContextProvider>
  );
}
