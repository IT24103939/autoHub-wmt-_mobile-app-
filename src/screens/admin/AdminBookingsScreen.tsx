import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ApiClient } from "../../services/ApiClient";

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  garageName: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#10B981",
  PENDING: "#F59E0B",
  CANCELLED: "#EF4444",
};

export function AdminBookingsScreen() {
  const { colors } = useAppTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  const load = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.get<Appointment[]>("/admin/appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load appointments:", e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const BookingCard = ({ item }: { item: Appointment }) => {
    const statusColor = STATUS_COLORS[item.status] ?? "#6B7280";
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: "#F59E0B15" }]}>
            <MaterialCommunityIcons name="calendar-check" size={22} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.customerName}</Text>
            <Text style={[styles.cardSub, { color: colors.mutedText }]}>{item.service}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.chipText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="garage" size={13} color={colors.mutedText} />
            <Text style={[styles.metaText, { color: colors.mutedText }]}>{item.garageName}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="calendar" size={13} color={colors.mutedText} />
            <Text style={[styles.metaText, { color: colors.mutedText }]}>{item.appointmentDate} • {item.appointmentTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="phone" size={13} color={colors.mutedText} />
            <Text style={[styles.metaText, { color: colors.mutedText }]}>{item.customerPhone}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.banner, { backgroundColor: "#F59E0B" }]}>
        <Text style={styles.bannerCount}>{appointments.length}</Text>
        <Text style={styles.bannerLabel}>Total Bookings</Text>
      </View>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No bookings found</Text>
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
  chipText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardFooter: { borderTopWidth: 0.5, paddingTop: 10, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, flex: 1 },
  emptyText: { fontSize: 15, marginTop: 12 },
});
