import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "OrderHistory">;

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  itemCount: number;
  status: "delivered" | "processing" | "shipped" | "cancelled";
}

export function OrderHistoryScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setOrders([
        {
          id: "1",
          orderNumber: "ORD-001",
          date: "2024-05-01",
          total: 2499,
          itemCount: 3,
          status: "delivered"
        },
        {
          id: "2",
          orderNumber: "ORD-002",
          date: "2024-04-28",
          total: 1899,
          itemCount: 2,
          status: "delivered"
        },
        {
          id: "3",
          orderNumber: "ORD-003",
          date: "2024-04-25",
          total: 3299,
          itemCount: 5,
          status: "shipped"
        },
        {
          id: "4",
          orderNumber: "ORD-004",
          date: "2024-04-20",
          total: 1299,
          itemCount: 1,
          status: "processing"
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
      delivered: { bg: "#D4EDDA", text: "#155724", icon: "check-circle" },
      shipped: { bg: "#D1ECF1", text: "#0C5460", icon: "truck" },
      processing: { bg: "#FFF3CD", text: "#856404", icon: "clock" },
      cancelled: { bg: "#F8D7DA", text: "#721C24", icon: "close-circle" }
    };

    const config = statusConfig[status] || statusConfig.processing;
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <MaterialCommunityIcons name={config.icon as any} size={12} color={config.text} />
        <Text style={[styles.badgeText, { color: config.text }]}>{status}</Text>
      </View>
    );
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.orderNumber, { color: colors.text }]}>{item.orderNumber}</Text>
          <Text style={[styles.orderDate, { color: colors.mutedText }]}>{item.date}</Text>
        </View>
        {getStatusBadge(item.status)}
      </View>

      <View style={[styles.divider, { borderBottomColor: colors.border }]} />

      <View style={styles.cardFooter}>
        <Text style={[styles.itemCount, { color: colors.mutedText }]}>
          {item.itemCount} {item.itemCount === 1 ? "item" : "items"}
        </Text>
        <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{item.total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={[styles.trackButton, { backgroundColor: colors.primary + "20" }]}
        onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
      >
        <Text style={[styles.trackButtonText, { color: colors.primary }]}>Track Order</Text>
        <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="package-box-open" size={48} color={colors.mutedText} />
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>No orders yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
            Start shopping to place your first order
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  orderDate: {
    fontSize: 12
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
  divider: {
    borderBottomWidth: 1,
    marginVertical: 12
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  itemCount: {
    fontSize: 12
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700"
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: "600"
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8
  }
});
