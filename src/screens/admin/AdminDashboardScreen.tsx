import React, { useState, useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useShop } from "../../hooks/useShop";

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
  const { notifications, markNotificationsAsRead } = useShop();
  const insets = useSafeAreaInsets();
  
  const unreadCount = notifications.filter(n => !n.read).length;
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
      const { AdminApiService } = require("../../services/AdminApiService");
      const response = await AdminApiService.getSystemStats();
      if (response) {
        setStats({
          totalUsers: response.totalUsers || 0,
          totalGarages: response.totalGarages || 0,
          totalAppointments: response.totalAppointments || 0,
          totalSuppliers: response.totalSuppliers || 0,
        });
      }
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
    icon
  }: {
    label: string;
    value: number;
    color: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.statIconCircle, { backgroundColor: color + "15" }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: colors.mutedText }]}>
          {label}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Dynamic Header */}
      <View style={[styles.dashboardHeader, { paddingTop: statusBarOffset + 12 }]}>
        <View>
          <Text style={[styles.dashboardTitle, { color: colors.text }]}>Admin Panel</Text>
          <Text style={[styles.dateText, { color: colors.mutedText }]}>
            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <Pressable
            style={[
              styles.iconButton,
              { borderColor: colors.border, backgroundColor: colors.card }
            ]}
            onPress={() => {
              markNotificationsAsRead();
              navigation.navigate("AccountTab", { screen: "NotificationsCenter" });
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Welcome Banner */}
        <View style={[styles.welcomeBanner, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.welcomeRole}>Admin Panel</Text>
            <Text style={styles.welcomeName}>Hi, {currentUser?.fullName?.split(" ")[0] ?? "Admin"} 👋</Text>
          </View>
          <View style={[styles.welcomeAvatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <MaterialCommunityIcons name="shield-account" size={30} color="white" />
          </View>
        </View>

      {loading ? (
        <View style={{ alignItems: "center", paddingVertical: 60 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                label="Users"
                value={stats.totalUsers}
                color="#4F46E5"
                icon="account-group-outline"
              />
              <StatCard
                label="Garages"
                value={stats.totalGarages}
                color="#10B981"
                icon="storefront-outline"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="Bookings"
                value={stats.totalAppointments}
                color="#F59E0B"
                icon="calendar-check-outline"
              />
              <StatCard
                label="Suppliers"
                value={stats.totalSuppliers}
                color="#EC4899"
                icon="truck-delivery-outline"
              />
            </View>
          </View>

          {/* Admin Actions */}
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Management
            </Text>

            <View style={styles.actionGrid}>
              {[
                { label: "Users", icon: "account-group", color: "#4F46E5", onPress: () => navigation.navigate("UsersTab") },
                { label: "Garages", icon: "store-cog", color: "#10B981", onPress: () => navigation.navigate("UsersTab", { screen: "AdminGarages" } as any) },
                { label: "Bookings", icon: "calendar-month", color: "#F59E0B", onPress: () => navigation.navigate("UsersTab", { screen: "AdminBookings" } as any) },
                { label: "Suppliers", icon: "account-hard-hat", color: "#EC4899", onPress: () => navigation.navigate("UsersTab", { screen: "AdminSuppliers" } as any) }
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.actionGridItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={item.onPress}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: item.color + "15" }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionGridItem: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
  },
  actionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
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
  welcomeBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeRole: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  welcomeName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  welcomeAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  dashboardTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "white",
  },
  notifBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
  },
});
