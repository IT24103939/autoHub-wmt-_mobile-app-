import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAuth } from "../../hooks/useAuth";
import { ApiClient } from "../../services/ApiClient";

export function AdminAccountScreen() {
  const { colors } = useAppTheme();
  const { currentUser, logout } = useAuth();

  // ----- Change Password Modal State -----
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ----- Activity Log Modal State -----
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [refreshingActivity, setRefreshingActivity] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await ApiClient.put("/account/me", {
        currentPassword,
        newPassword,
      });
      Alert.alert("Success", "Password changed successfully!");
      setIsPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const msg = error?.message || "Failed to change password. Check your current password.";
      Alert.alert("Error", msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const loadActivityLog = async () => {
    setIsLoadingActivity(true);
    try {
      // Load all users — activity log shows recent accounts & system events
      const data = await ApiClient.get<any[]>("/admin/users?limit=100&page=1");
      const users = Array.isArray(data) ? data : (data as any)?.users ?? [];

      // Build activity entries from user join dates + current admin sessions
      const entries = [
        {
          id: "admin-session",
          icon: "shield-account",
          color: "#4F46E5",
          title: "Admin session started",
          subtitle: `Logged in as ${currentUser?.fullName}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: "Today",
        },
        ...users.slice(0, 20).map((u: any) => ({
          id: u.id || u._id,
          icon: u.role === "GARAGE_OWNER" ? "garage" : u.role === "SUPPLIER" ? "account-hard-hat" : "account",
          color: u.role === "GARAGE_OWNER" ? "#10B981" : u.role === "SUPPLIER" ? "#EC4899" : "#6366F1",
          title: `New ${u.role?.toLowerCase().replace("_", " ")} registered`,
          subtitle: u.fullName,
          time: new Date(u.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date(u.createdAt).toLocaleDateString(),
        })),
      ];
      setActivityLog(entries);
    } catch (error) {
      console.error("Failed to load activity log:", error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const onRefreshActivity = async () => {
    setRefreshingActivity(true);
    await loadActivityLog();
    setRefreshingActivity(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const PrivilegeItem = ({ icon, title, description }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; description: string }) => (
    <View style={[styles.privilegeItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.privilegeIcon, { backgroundColor: colors.primary + "15" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.privilegeContent}>
        <Text style={[styles.privilegeTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.privilegeDescription, { color: colors.mutedText }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Admin Card */}
      <View style={[styles.adminCard, { backgroundColor: colors.primary }]}>
        <View style={styles.adminAvatarBox}>
          <MaterialCommunityIcons name="shield-account" size={36} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.adminRole}>Administrator</Text>
          <Text style={styles.adminName}>{currentUser?.fullName}</Text>
          <Text style={styles.adminPhone}>{currentUser?.phone}</Text>
        </View>
      </View>

      {/* Account Information */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>
        {[
          { label: "Full Name", value: currentUser?.fullName },
          { label: "Phone", value: currentUser?.phone },
          { label: "Role", value: "System Administrator" },
        ].map((item) => (
          <View key={item.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedText }]}>{item.label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Privileges */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privileges</Text>
        <PrivilegeItem icon="account-group" title="User Management" description="Create, view, and manage all user accounts" />
        <PrivilegeItem icon="garage" title="Garage Management" description="Monitor and manage garage profiles and services" />
        <PrivilegeItem icon="calendar-check" title="Appointment Oversight" description="View and manage all system appointments" />
        <PrivilegeItem icon="account-hard-hat" title="Supplier Management" description="Oversee spare parts suppliers and inventory" />
        <PrivilegeItem icon="chart-line" title="System Analytics" description="Access system-wide analytics and reports" />
      </View>

      {/* Security */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
        <TouchableOpacity
          style={[styles.securityBtn, { backgroundColor: "#F59E0B15", borderColor: "#F59E0B" }]}
          onPress={() => setIsPasswordModalVisible(true)}
        >
          <MaterialCommunityIcons name="lock-reset" size={20} color="#F59E0B" />
          <Text style={[styles.securityBtnText, { color: "#F59E0B" }]}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#F59E0B" style={{ marginLeft: "auto" }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.securityBtn, { backgroundColor: "#6366F115", borderColor: "#6366F1" }]}
          onPress={() => {
            setIsActivityModalVisible(true);
            loadActivityLog();
          }}
        >
          <MaterialCommunityIcons name="history" size={20} color="#6366F1" />
          <Text style={[styles.securityBtnText, { color: "#6366F1" }]}>Activity Log</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color="#6366F1" style={{ marginLeft: "auto" }} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.danger || "#EF4444" }]} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="white" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* ===== Change Password Modal ===== */}
      <Modal visible={isPasswordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Current Password */}
              <Text style={[styles.fieldLabel, { color: colors.mutedText }]}>Current Password</Text>
              <View style={[styles.passwordRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.mutedText}
                />
                <TouchableOpacity onPress={() => setShowCurrent(v => !v)}>
                  <MaterialCommunityIcons name={showCurrent ? "eye-off" : "eye"} size={20} color={colors.mutedText} />
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={[styles.fieldLabel, { color: colors.mutedText, marginTop: 16 }]}>New Password</Text>
              <View style={[styles.passwordRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.mutedText}
                />
                <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                  <MaterialCommunityIcons name={showNew ? "eye-off" : "eye"} size={20} color={colors.mutedText} />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={[styles.fieldLabel, { color: colors.mutedText, marginTop: 16 }]}>Confirm New Password</Text>
              <View style={[styles.passwordRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat new password"
                  placeholderTextColor={colors.mutedText}
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                  <MaterialCommunityIcons name={showConfirm ? "eye-off" : "eye"} size={20} color={colors.mutedText} />
                </TouchableOpacity>
              </View>

              {/* Strength hint */}
              {newPassword.length > 0 && (
                <Text style={[styles.strengthHint, { color: newPassword.length >= 8 ? "#10B981" : "#F59E0B" }]}>
                  {newPassword.length >= 8 ? "✓ Strong password" : "⚠ Minimum 6 characters recommended"}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: isChangingPassword ? 0.7 : 1 }]}
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Activity Log Modal ===== */}
      <Modal visible={isActivityModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Activity Log</Text>
              <TouchableOpacity onPress={() => setIsActivityModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.mutedText} />
              </TouchableOpacity>
            </View>

            {isLoadingActivity ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading activity...</Text>
              </View>
            ) : (
              <FlatList
                data={activityLog}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 480 }}
                refreshControl={<RefreshControl refreshing={refreshingActivity} onRefresh={onRefreshActivity} />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <View style={[styles.activityItem, { borderBottomColor: colors.border }]}>
                    <View style={[styles.activityIcon, { backgroundColor: item.color + "18" }]}>
                      <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.activitySub, { color: colors.mutedText }]}>{item.subtitle}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[styles.activityTime, { color: colors.mutedText }]}>{item.time}</Text>
                      <Text style={[styles.activityDate, { color: colors.mutedText }]}>{item.date}</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyLog}>
                    <MaterialCommunityIcons name="history" size={40} color={colors.mutedText} />
                    <Text style={[styles.emptyLogText, { color: colors.mutedText }]}>No activity found</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 60 },

  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  adminAvatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminRole: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  adminName: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 },
  adminPhone: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },

  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, padding: 14, paddingBottom: 10 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 14, fontWeight: "600" },

  privilegeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 0.5,
  },
  privilegeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  privilegeContent: { flex: 1 },
  privilegeTitle: { fontSize: 14, fontWeight: "600", marginBottom: 1 },
  privilegeDescription: { fontSize: 12 },

  securityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 14,
    marginVertical: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityBtnText: { fontSize: 15, fontWeight: "600", flex: 1 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutBtnText: { color: "white", fontSize: 16, fontWeight: "700" },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalBody: { padding: 20 },

  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  passwordInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  strengthHint: { fontSize: 12, marginTop: 6, fontWeight: "500" },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "700" },

  // Activity Log
  loadingBox: { alignItems: "center", paddingVertical: 60, gap: 12 },
  loadingText: { fontSize: 14 },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  activityIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  activitySub: { fontSize: 12 },
  activityTime: { fontSize: 12, fontWeight: "600" },
  activityDate: { fontSize: 11, marginTop: 1 },
  emptyLog: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyLogText: { fontSize: 14 },
});
