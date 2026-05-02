import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ApiClient } from "../../services/ApiClient";

interface Garage {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  services: string[];
  createdAt: string;
}

export function AdminGaragesScreen() {
  const { colors } = useAppTheme();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.get<Garage[]>("/admin/garages");
      setGarages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load garages:", e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const GarageCard = ({ item }: { item: Garage }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: "#10B98115" }]}>
          <MaterialCommunityIcons name="garage" size={22} color="#10B981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardSub, { color: colors.mutedText }]}>{item.city}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: "#10B98115" }]}>
          <Text style={[styles.chipText, { color: "#10B981" }]}>{item.services.length} Services</Text>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="map-marker" size={13} color={colors.mutedText} />
          <Text style={[styles.metaText, { color: colors.mutedText }]} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="phone" size={13} color={colors.mutedText} />
          <Text style={[styles.metaText, { color: colors.mutedText }]}>{item.phone || "N/A"}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Text style={styles.bannerCount}>{garages.length}</Text>
        <Text style={styles.bannerLabel}>Total Garages</Text>
      </View>
      <FlatList
        data={garages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GarageCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <MaterialCommunityIcons name="garage-alert" size={48} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No garages found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bannerCount: { color: "white", fontSize: 32, fontWeight: "900" },
  bannerLabel: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cardSub: { fontSize: 12 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  chipText: { fontSize: 11, fontWeight: "700" },
  cardFooter: { borderTopWidth: 0.5, paddingTop: 10, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, flex: 1 },
  emptyText: { fontSize: 15, marginTop: 12 },
});
