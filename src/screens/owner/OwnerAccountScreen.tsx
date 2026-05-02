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
  Platform,
  Modal
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useShop } from "../../hooks/useShop";

type Props = NativeStackScreenProps<RootStackParamList, "OwnerAccount">;

export function OwnerAccountScreen({ navigation }: Props) {
  const { currentUser, updateAccount, deleteAccount, isLoading } = useAuth();
  const { appointments, garages } = useShop();
  const { colors } = useAppTheme();

  const [fullName, setFullName] = useState(currentUser?.fullName ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  const ownerGarageIds = garages
    .filter((garage) => garage.ownerId === currentUser?.id)
    .map((garage) => garage.id);

  const ownerNotifications = appointments
    .filter((appointment) => ownerGarageIds.includes(appointment.garageId))
    .sort((a, b) => `${b.appointmentDate} ${b.appointmentTime}`.localeCompare(`${a.appointmentDate} ${a.appointmentTime}`));

  const newNotificationsCount = ownerNotifications.filter((appointment) => appointment.status === "PENDING").length;

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

        <View style={styles.topBar}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Account Settings</Text>
          <Pressable
            style={[styles.notificationButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setIsNotificationsVisible(true)}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {newNotificationsCount > 0 ? (
              <View style={[styles.notificationBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.notificationBadgeText}>
                  {newNotificationsCount > 9 ? "9+" : String(newNotificationsCount)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

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

      <Modal visible={isNotificationsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}> 
              <Text style={[styles.modalTitle, { color: colors.text }]}>Booking Notifications</Text>
              <Pressable onPress={() => setIsNotificationsVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {ownerNotifications.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>No notifications yet.</Text>
                </View>
              ) : (
                ownerNotifications.map((appointment) => (
                  <View
                    key={`owner-notif-${appointment.id}`}
                    style={[styles.notificationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                      {appointment.customerName} booked {appointment.service}
                    </Text>
                    <Text style={[styles.notificationMeta, { color: colors.mutedText }]}>
                      {appointment.garageName} • {appointment.appointmentDate} {appointment.appointmentTime}
                    </Text>
                    <Text style={[styles.notificationStatus, { color: appointment.status === "PENDING" ? colors.danger : colors.primary }]}>
                      {appointment.status}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800"
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  notificationIcon: {
    fontSize: 18
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700"
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "600"
  },
  modalBody: {
    padding: 16
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14
  },
  emptyText: {
    fontSize: 13
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4
  },
  notificationMeta: {
    fontSize: 12,
    marginBottom: 4
  },
  notificationStatus: {
    fontSize: 12,
    fontWeight: "700"
  }
});
