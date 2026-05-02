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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAuth } from "../../hooks/useAuth";

export function AdminAccountScreen() {
  const theme = useAppTheme();
  const colors = theme.colors;
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      // TODO: Add admin profile update API endpoint
      // await AdminApiService.updateProfile(formData);
      Alert.alert("Success", "Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: () => logout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Admin Info Card */}
      <View
        style={[
          styles.adminCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: colors.primary + "30" },
            ]}
          >
            <Text style={styles.avatarText}>👨‍💼</Text>
          </View>
          <View style={styles.adminInfo}>
            <Text style={[styles.adminName, { color: colors.text }]}>
              {user?.fullName}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                ADMIN
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Information
          </Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Text style={[styles.editButton, { color: colors.primary }]}>
              {editMode ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {editMode ? (
          <View>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Full Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholder="Enter full name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Phone
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                editable={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Full Name
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.fullName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Phone
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {user?.phone}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Role
              </Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                Administrator
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Administrative Privileges */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Privileges
        </Text>
        <View
          style={[
            styles.privilegeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <PrivilegeItem
            icon="✓"
            title="User Management"
            description="Create, view, and manage all user accounts"
            colors={colors}
          />
          <PrivilegeItem
            icon="✓"
            title="Garage Management"
            description="Monitor and manage garage profiles and services"
            colors={colors}
          />
          <PrivilegeItem
            icon="✓"
            title="Appointment Oversight"
            description="View and manage all system appointments"
            colors={colors}
          />
          <PrivilegeItem
            icon="✓"
            title="Supplier Management"
            description="Oversee spare parts suppliers and inventory"
            colors={colors}
          />
          <PrivilegeItem
            icon="✓"
            title="System Analytics"
            description="Access system-wide analytics and reports"
            colors={colors}
          />
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Security
        </Text>

        <TouchableOpacity
          style={[
            styles.securityButton,
            { backgroundColor: colors.warning + "20", borderColor: colors.warning },
          ]}
        >
          <Text style={[styles.securityButtonText, { color: colors.warning }]}>
            🔒 Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.securityButton,
            { backgroundColor: colors.info + "20", borderColor: colors.info },
          ]}
        >
          <Text style={[styles.securityButtonText, { color: colors.info }]}>
            🔔 Activity Log
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: colors.error },
        ]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function PrivilegeItem({
  icon,
  title,
  description,
  colors,
}: {
  icon: string;
  title: string;
  description: string;
  colors: any;
}) {
  return (
    <View style={styles.privilegeItem}>
      <Text style={styles.privilegeIcon}>{icon}</Text>
      <View style={styles.privilegeContent}>
        <Text style={[styles.privilegeTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.privilegeDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  adminCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    fontSize: 14,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  privilegeCard: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  privilegeItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  privilegeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  privilegeContent: {
    flex: 1,
  },
  privilegeTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  privilegeDescription: {
    fontSize: 12,
  },
  securityButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  securityButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
