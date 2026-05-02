import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ApiClient } from "../../services/ApiClient";

interface Supplier {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export function AdminSuppliersScreen() {
  const { colors } = useAppTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.get<Supplier[]>("/admin/suppliers");
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load suppliers:", e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const SupplierCard = ({ item }: { item: Supplier }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: "#EC489915" }]}>
          <MaterialCommunityIcons name="account-hard-hat" size={22} color="#EC4899" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.fullName}</Text>
          <Text style={[styles.cardSub, { color: colors.mutedText }]}>{item.email || "No email"}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: "#EC489915" }]}>
          <Text style={[styles.chipText, { color: "#EC4899" }]}>SUPPLIER</Text>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="phone" size={13} color={colors.mutedText} />
          <Text style={[styles.metaText, { color: colors.mutedText }]}>{item.phone}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="calendar-account" size={13} color={colors.mutedText} />
          <Text style={[styles.metaText, { color: colors.mutedText }]}>
            Joined {new Date(item.createdAt).toLocaleDateString()}
          </Text>
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
      <View style={[styles.banner, { backgroundColor: "#EC4899" }]}>
        <Text style={styles.bannerCount}>{suppliers.length}</Text>
        <Text style={styles.bannerLabel}>Total Suppliers</Text>
      </View>
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SupplierCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <MaterialCommunityIcons name="account-hard-hat-outline" size={48} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No suppliers found</Text>
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
  bannerLabel: { color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cardSub: { fontSize: 12 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  chipText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  cardFooter: { borderTopWidth: 0.5, paddingTop: 10, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, flex: 1 },
  emptyText: { fontSize: 15, marginTop: 12 },
});
