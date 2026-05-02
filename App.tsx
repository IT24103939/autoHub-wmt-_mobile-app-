import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ShopProvider } from "./src/context/ShopContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useAppTheme } from "./src/hooks/useAppTheme";

function RootNavigation() {
  const { navigationTheme } = useAppTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <ShopProvider>
            <RootNavigation />
          </ShopProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
