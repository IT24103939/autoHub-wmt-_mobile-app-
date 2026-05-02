import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useShop } from "../../hooks/useShop";
import { Appointment } from "../../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "MyBookings">;

export function MyBookingsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { appointments } = useShop();
  const [isLoading, setIsLoading] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    const filtered = filterAppointments(appointments);
    setFilteredAppointments(filtered);
    setIsLoading(false);
  }, [appointments, filter]);

  const filterAppointments = (data: Appointment[]) => {
    const today = new Date().toISOString().split("T")[0];
    switch (filter) {
      case "upcoming":
        return data.filter((a) => a.appointmentDate >= today && a.status !== "cancelled");
      case "completed":
        return data.filter((a) => a.status === "completed");
      case "cancelled":
        return data.filter((a) => a.status === "cancelled");
      default:
        return data;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
      pending: { bg: "#FFF3CD", text: "#856404", icon: "clock" },
      confirmed: { bg: "#D1ECF1", text: "#0C5460", icon: "check-circle" },
      completed: { bg: "#D4EDDA", text: "#155724", icon: "check" },
      cancelled: { bg: "#F8D7DA", text: "#721C24", icon: "close" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <MaterialCommunityIcons name={config.icon as any} size={12} color={config.text} />
        <Text style={[styles.badgeText, { color: config.text }]}>{status}</Text>
      </View>
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        // Could navigate to appointment detail if needed
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.garageName, { color: colors.text }]}>{item.garageName}</Text>
        {getStatusBadge(item.status)}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="calendar" size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.appointmentDate}</Text>
        </View>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="clock" size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.appointmentTime}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="wrench" size={16} color={colors.primary} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.service}</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notes}>
          <Text style={[styles.notesLabel, { color: colors.mutedText }]}>Notes:</Text>
          <Text style={[styles.notesText, { color: colors.text }]}>{item.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterContainer}>
        {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === f ? colors.primary : colors.card,
                borderColor: colors.border
              }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? colors.primaryText : colors.text }
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredAppointments.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.mutedText} />
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>
            No {filter === "all" ? "" : filter} bookings found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  filterContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  garageName: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize"
  },
  cardDetails: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 16
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1
  },
  detailText: {
    fontSize: 14,
    fontWeight: "500"
  },
  notes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)"
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4
  },
  notesText: {
    fontSize: 13
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12
  }
});
