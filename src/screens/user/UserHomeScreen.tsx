import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image, Platform, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useShop } from "../../hooks/useShop";
import { useAuth } from "../../hooks/useAuth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "UserHome">;

export function UserHomeScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { spareParts, garages, notifications, markNotificationsAsRead } = useShop();
  const unreadCount = notifications.filter(n => !n.read).length;
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();

  const featuredParts = useMemo(() => spareParts.slice(0, 4), [spareParts]);
  const topGarages = useMemo(() => garages.slice(0, 3), [garages]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = currentUser?.fullName?.split(" ")[0] ?? "there";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero Header */}
        <View style={[styles.hero, { backgroundColor: colors.primary, paddingTop: insets.top + 16 }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={styles.heroGreeting}>{greeting()},</Text>
              <Text style={styles.heroName}>{firstName} 👋</Text>
            </View>
            <Pressable
              style={styles.notifBtn}
              onPress={() => {
                markNotificationsAsRead();
                navigation.navigate("AccountTab", { screen: "NotificationsCenter" });
              }}
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color="white" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Search Bar inside hero */}
          <Pressable
            style={styles.searchBar}
            onPress={() => navigation.getParent()?.navigate("BrowseTab" as any)}
          >
            <MaterialCommunityIcons name="magnify" size={18} color="#666" />
            <Text style={styles.searchPlaceholder}>Search parts, garages...</Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: "car-wrench", label: "Garages", color: "#4F46E5", onPress: () => navigation.navigate("Garages") },
            { icon: "calendar-plus", label: "Book Now", color: "#10B981", onPress: () => topGarages[0] && navigation.navigate("AppointmentBooking", { garageId: topGarages[0].id }) },
            { icon: "package-variant", label: "Parts", color: "#F59E0B", onPress: () => navigation.navigate("SpareParts") },
            { icon: "magnify", label: "Search", color: "#EC4899", onPress: () => navigation.getParent()?.navigate("BrowseTab" as any) },
          ].map((item) => (
            <Pressable key={item.label} style={styles.quickActionItem} onPress={item.onPress}>
              <View style={[styles.quickActionIcon, { backgroundColor: item.color + "18" }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Featured Spare Parts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Parts</Text>
            <Pressable onPress={() => navigation.navigate("SpareParts")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
            {featuredParts.length === 0 ? (
              <View style={[styles.emptyHint, { backgroundColor: colors.card }]}>
                <MaterialCommunityIcons name="package-variant-closed" size={32} color={colors.mutedText} />
                <Text style={[styles.emptyHintText, { color: colors.mutedText }]}>No parts yet</Text>
              </View>
            ) : (
              featuredParts.map((part) => (
                <Pressable
                  key={part.id}
                  style={[styles.partCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate("SparePartDetails", { partId: part.id })}
                >
                  <View style={[styles.partImageBox, { backgroundColor: colors.background }]}>
                    {part.image ? (
                      <Image source={{ uri: part.image }} style={styles.partImage} resizeMode="cover" />
                    ) : (
                      <MaterialCommunityIcons name="package" size={36} color={colors.primary} />
                    )}
                  </View>
                  <Text style={[styles.partName, { color: colors.text }]} numberOfLines={1}>{part.name}</Text>
                  <Text style={[styles.partCategory, { color: colors.mutedText }]} numberOfLines={1}>{part.category}</Text>
                  <Text style={[styles.partPrice, { color: colors.primary }]}>Rs {(part.price ?? 0).toLocaleString()}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Top Garages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Garages</Text>
            <Pressable onPress={() => navigation.navigate("Garages")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
            </Pressable>
          </View>

          <View style={{ gap: 10 }}>
            {topGarages.length === 0 ? (
              <View style={[styles.emptyHint, { backgroundColor: colors.card }]}>
                <MaterialCommunityIcons name="garage" size={32} color={colors.mutedText} />
                <Text style={[styles.emptyHintText, { color: colors.mutedText }]}>No garages yet</Text>
              </View>
            ) : (
              topGarages.map((garage) => (
                <Pressable
                  key={garage.id}
                  style={[styles.garageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate("GarageDetails", { garageId: garage.id })}
                >
                  <View style={[styles.garageIconBox, { backgroundColor: colors.primary + "15" }]}>
                    <MaterialCommunityIcons name="garage" size={28} color={colors.primary} />
                  </View>
                  <View style={styles.garageInfo}>
                    <Text style={[styles.garageName, { color: colors.text }]} numberOfLines={1}>{garage.name}</Text>
                    <Text style={[styles.garageAddress, { color: colors.mutedText }]} numberOfLines={1}>{garage.city}</Text>
                    <View style={styles.garageMeta}>
                      <MaterialCommunityIcons name="map-marker" size={12} color={colors.mutedText} />
                      <Text style={[styles.garageMetaText, { color: colors.mutedText }]}>{garage.address}</Text>
                    </View>
                  </View>
                  <View style={styles.garageArrow}>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedText} />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Hero
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroText: { flex: 1 },
  heroGreeting: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "500" },
  heroName: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 2 },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#FF3B30",
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: { color: "white", fontSize: 9, fontWeight: "bold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  searchPlaceholder: { color: "#999", fontSize: 14, flex: 1 },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 8,
  },
  quickActionItem: { flex: 1, alignItems: "center", gap: 6 },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: { fontSize: 11, fontWeight: "600" },

  // Sections
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },

  // Parts
  partCard: {
    width: 140,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  partImageBox: {
    height: 90,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  partImage: { width: "100%", height: "100%" },
  partName: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  partCategory: { fontSize: 11, marginBottom: 6 },
  partPrice: { fontSize: 14, fontWeight: "800" },

  // Garages
  garageCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  garageIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  garageInfo: { flex: 1 },
  garageName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  garageAddress: { fontSize: 12, marginBottom: 4 },
  garageMeta: { flexDirection: "row", alignItems: "center", gap: 3 },
  garageMetaText: { fontSize: 11 },
  garageArrow: {},

  // Empty
  emptyHint: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    borderRadius: 14,
    gap: 8,
    flex: 1,
  },
  emptyHintText: { fontSize: 13 },
});
