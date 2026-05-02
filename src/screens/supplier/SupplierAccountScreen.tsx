import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "SupplierAccount">;

export function SupplierAccountScreen({ navigation }: Props) {
  const { currentUser, updateAccount, deleteAccount, isLoading } = useAuth();
  const { colors } = useAppTheme();

  const [fullName, setFullName] = useState(currentUser?.fullName ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text, marginTop: 12 }]}>Loading account...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Account not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full name cannot be empty.");
      return;
    }
    if (phone.trim().length < 9) {
      Alert.alert("Validation Error", "Enter a valid phone number.");
      return;
    }
    if (!currentPassword) {
      Alert.alert("Validation Error", "Enter your current password to save changes.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "New passwords do not match.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      Alert.alert("Validation Error", "New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await updateAccount({
        fullName,
        phone,
        currentPassword,
        newPassword: newPassword || undefined
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Account details updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update account.";
      Alert.alert("Update Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account. This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await deleteAccount();
            } catch {
              Alert.alert("Error", "Failed to delete account. Please try again.");
              setDeleteLoading(false);
            }
          }
        }
      ]
    );
  };

  const inputStyle = [styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }];
  const labelStyle = [styles.label, { color: colors.mutedText }];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>

          <Text style={labelStyle}>Full Name</Text>
          <TextInput
            style={inputStyle}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="words"
          />

          <Text style={labelStyle}>Phone Number</Text>
          <TextInput
            style={inputStyle}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor={colors.mutedText}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
          <Text style={[styles.sectionHint, { color: colors.mutedText }]}>
            Leave "New Password" blank to keep your current password.
          </Text>

          <Text style={labelStyle}>Current Password *</Text>
          <TextInput
            style={inputStyle}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Required to save any changes"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
          />

          <Text style={labelStyle}>New Password</Text>
          <TextInput
            style={inputStyle}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Leave blank to keep current"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
          />

          <Text style={labelStyle}>Confirm New Password</Text>
          <TextInput
            style={inputStyle}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
          />
        </View>

        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </Pressable>

        <View style={[styles.dangerSection, { borderColor: colors.danger }]}>
          <Text style={[styles.dangerTitle, { color: colors.danger }]}>Danger Zone</Text>
          <Text style={[styles.dangerHint, { color: colors.mutedText }]}>
            Deleting your account is permanent. All data will be lost.
          </Text>
          <Pressable
            style={[styles.deleteButton, { borderColor: colors.danger }, deleteLoading && styles.disabled]}
            onPress={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <Text style={[styles.deleteButtonText, { color: colors.danger }]}>Delete My Account</Text>
            )}
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  sectionHint: {
    fontSize: 12,
    marginBottom: 10,
    marginTop: -6
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15
  },
  dangerSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6
  },
  dangerHint: {
    fontSize: 12,
    marginBottom: 14
  },
  deleteButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
  },
  deleteButtonText: {
    fontWeight: "700",
    fontSize: 14
  },
  disabled: {
    opacity: 0.5
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500"
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600"
  }
});
