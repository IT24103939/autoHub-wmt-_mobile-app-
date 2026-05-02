import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Pressable,
  Image,
  StatusBar,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAuth } from "../../hooks/useAuth";
import { ApiClient } from "../../services/ApiClient";

interface SystemStats {
  totalUsers: number;
  totalGarages: number;
  totalAppointments: number;
  totalSuppliers: number;
}

type AdminNavigationProp = NativeStackNavigationProp<any>;

export function AdminDashboardScreen() {
  const theme = useAppTheme();
  const colors = theme.colors;
  const navigation = useNavigation<AdminNavigationProp>();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalGarages: 0,
    totalAppointments: 0,
    totalSuppliers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] = useState(false);

  const statusBarOffset = Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const headerIconTop = statusBarOffset + 6;

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Add admin API endpoints to fetch stats
      // const response = await ApiClient.get('/admin/stats');
      // setStats(response.data);

      // Mock data for now
      setStats({
        totalUsers: 156,
        totalGarages: 12,
        totalAppointments: 324,
        totalSuppliers: 8,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: color, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.statValue, { color: colors.background }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.background }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Notification icon */}
      <Pressable
        style={[
          styles.notificationIconButton,
          { borderColor: colors.border, backgroundColor: colors.card }
        ]}
        onPress={() => setIsNotificationsModalVisible(true)}
        accessibilityLabel="Open notifications"
      >
        <Text style={styles.notificationIconText}>🔔</Text>
      </Pressable>

      {/* Profile icon */}
      <Pressable
        style={[
          styles.profileIconButton,
          { borderColor: colors.border, backgroundColor: colors.card }
        ]}
        onPress={() => navigation.navigate("BrowseTab" as any)}
        accessibilityLabel="Open profile"
      >
        <Image
          source={require("../../assets/icons/profile-icon.png")}
          style={styles.profileIconImage}
          resizeMode="contain"
        />
      </Pressable>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.contentContainer, { paddingTop: headerIconTop + 60 }]}
      >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Admin Dashboard
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          System Overview
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                label="Total Users"
                value={stats.totalUsers}
                color={colors.primary}
              />
              <StatCard
                label="Garages"
                value={stats.totalGarages}
                color={colors.success}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="Appointments"
                value={stats.totalAppointments}
                color={colors.warning}
              />
              <StatCard
                label="Suppliers"
                value={stats.totalSuppliers}
                color={colors.info}
              />
            </View>
          </View>

          {/* Admin Actions */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Management
            </Text>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary, borderColor: colors.border },
              ]}
              onPress={() => navigation.navigate("AdminUsers")}
            >
              <Text style={styles.actionButtonText}>👥 Manage Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.success, borderColor: colors.border },
              ]}
            >
              <Text style={styles.actionButtonText}>🏪 Manage Garages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.warning, borderColor: colors.border },
              ]}
            >
              <Text style={styles.actionButtonText}>📅 View Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.info, borderColor: colors.border },
              ]}
            >
              <Text style={styles.actionButtonText}>📦 Manage Suppliers</Text>
            </TouchableOpacity>
          </View>

          {/* System Info */}
          <View
            style={[
              styles.infoSection,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              System Information
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                API Status:
              </Text>
              <Text style={[styles.infoValue, { color: colors.success }]}>
                ✓ Connected
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Last Sync:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Just now
              </Text>
            </View>
          </View>
        </>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
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
  profileIconButton: {
    position: "absolute",
    top: 50,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  notificationIconButton: {
    position: "absolute",
    top: 50,
    right: 60,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  notificationIconText: {
    fontSize: 18
  },
  profileIconImage: {
    width: 20,
    height: 20
  },
});
