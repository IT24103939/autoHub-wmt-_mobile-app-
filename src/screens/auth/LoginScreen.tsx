import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { colors } = useAppTheme();
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const onLogin = async () => {
    setError("");

    if (!phone.trim() || !password) {
      setError("Please enter phone and password");
      return;
    }

    try {
      await login(phone, password);
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed"
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Login</Text>

      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone number"
        placeholderTextColor={colors.mutedText}
        keyboardType="phone-pad"
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={colors.mutedText}
        secureTextEntry
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
      />

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={onLogin}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Sign In</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={[styles.link, { color: colors.primary }]}>Forgot Password?</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={[styles.link, { color: colors.primary }]}>Create a new account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  error: {
    marginBottom: 10
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12
  },
  primaryButtonText: {
    fontWeight: "700"
  },
  link: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16
  }
});
