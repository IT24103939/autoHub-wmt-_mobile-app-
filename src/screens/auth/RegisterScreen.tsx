import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Role } from "../../types/models";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";

const roleOptions: { label: string; value: Role }[] = [
  { label: "User", value: "USER" },
  { label: "Garage Owner", value: "GARAGE_OWNER" },
  { label: "Supplier", value: "SUPPLIER" }
];

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { colors } = useAppTheme();
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role>("USER");
  const [error, setError] = React.useState("");

  const onRegister = async () => {
    setError("");

    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      setError("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await register({ fullName, phone, password, role });
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Register failed"
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Register</Text>

      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full name"
        placeholderTextColor={colors.mutedText}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
      />
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

      <Text style={[styles.roleLabel, { color: colors.text }]}>Select role</Text>
      <View style={styles.roleRow}>
        {roleOptions.map((option) => {
          const isActive = option.value === role;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.roleChip,
                { borderColor: colors.border, backgroundColor: colors.card },
                isActive && [styles.roleChipActive, { borderColor: colors.primary, backgroundColor: colors.accentSurface }]
              ]}
              onPress={() => setRole(option.value)}
            >
              <Text
                style={[
                  styles.roleChipText,
                  { color: colors.text },
                  isActive && [styles.roleChipTextActive, { color: colors.primary }]
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={onRegister}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Create Account</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={[styles.link, { color: colors.primary }]}>Already have an account? Sign in</Text>
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
  roleLabel: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8
  },
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  },
  roleChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  roleChipActive: {
    borderColor: "#0A6EBD"
  },
  roleChipText: {},
  roleChipTextActive: {
    fontWeight: "700"
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
    fontWeight: "600"
  }
});
