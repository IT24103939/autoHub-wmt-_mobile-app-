import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "OrderTracking">;

interface TrackingEvent {
  status: string;
  timestamp: string;
  completed: boolean;
  description: string;
  icon: string;
}

export function OrderTrackingScreen({ route }: Props) {
  const { colors } = useAppTheme();
  const { orderId } = route.params;
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    // Mock tracking data
    setTrackingEvents([
      {
        status: "Order Placed",
        timestamp: "2024-05-01 10:30 AM",
        completed: true,
        description: "Your order has been placed successfully",
        icon: "check-circle"
      },
      {
        status: "Order Confirmed",
        timestamp: "2024-05-01 11:45 AM",
        completed: true,
        description: "Seller has confirmed your order",
        icon: "check-circle"
      },
      {
        status: "Processing",
        timestamp: "2024-05-01 02:00 PM",
        completed: true,
        description: "Your order is being prepared",
        icon: "check-circle"
      },
      {
        status: "Shipped",
        timestamp: "2024-05-02 08:00 AM",
        completed: true,
        description: "Your order is on the way",
        icon: "check-circle"
      },
      {
        status: "Out for Delivery",
        timestamp: "2024-05-02 04:30 PM",
        completed: false,
        description: "Your package is out for delivery today",
        icon: "truck"
      },
      {
        status: "Delivered",
        timestamp: "Expected by today",
        completed: false,
        description: "Expected delivery time",
        icon: "home"
      }
    ]);
  }, [orderId]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Order Details Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order {orderId}</Text>
        <View style={styles.statusBadge}>
          <MaterialCommunityIcons name="truck" size={16} color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.primary }]}>Out for Delivery</Text>
        </View>
      </View>

      {/* Tracking Timeline */}
      <View style={styles.timeline}>
        {trackingEvents.map((event, index) => (
          <View key={index} style={styles.timelineItem}>
            {/* Timeline dot and line */}
            <View style={styles.timelineMarker}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: event.completed ? colors.success : colors.mutedText,
                    borderColor: colors.background
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={event.icon as any}
                  size={14}
                  color={colors.background}
                />
              </View>
              {index < trackingEvents.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: event.completed ? colors.success : colors.border
                    }
                  ]}
                />
              )}
            </View>

            {/* Event content */}
            <View style={styles.content}>
              <Text style={[styles.eventStatus, { color: colors.text }]}>
                {event.status}
              </Text>
              <Text style={[styles.eventDescription, { color: colors.mutedText }]}>
                {event.description}
              </Text>
              <Text style={[styles.eventTimestamp, { color: colors.mutedText }]}>
                {event.timestamp}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
        <View style={styles.addressBox}>
          <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.addressName, { color: colors.text }]}>John Doe</Text>
            <Text style={[styles.addressText, { color: colors.mutedText }]}>
              123 Main Street, Apartment 4B, New York, NY 10001
            </Text>
            <Text style={[styles.addressText, { color: colors.mutedText }]}>Phone: +1-555-0123</Text>
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
        <View style={styles.itemRow}>
          <Text style={[styles.itemName, { color: colors.text }]}>Spare Part XYZ</Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>₹499</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={[styles.itemName, { color: colors.text }]}>Spare Part ABC</Text>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>₹799</Text>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.border }]} />
        <View style={styles.itemRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
          <Text style={[styles.totalPrice, { color: colors.primary }]}>₹1,299</Text>
        </View>
      </View>

      {/* Estimated Delivery */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.estimatedBox}>
          <MaterialCommunityIcons name="calendar-check" size={24} color={colors.success} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.estimatedLabel, { color: colors.mutedText }]}>
              Estimated Delivery
            </Text>
            <Text style={[styles.estimatedDate, { color: colors.text }]}>
              Today by 6:00 PM
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    margin: 16,
    borderRadius: 12,
    marginBottom: 24
  },
  orderId: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600"
  },
  timeline: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16
  },
  timelineMarker: {
    alignItems: "center",
    marginRight: 16,
    width: 40
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  line: {
    width: 2,
    height: 40,
    marginTop: 4
  },
  content: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 8
  },
  eventStatus: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  eventDescription: {
    fontSize: 13,
    marginBottom: 4
  },
  eventTimestamp: {
    fontSize: 12
  },
  section: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  addressBox: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4
  },
  addressText: {
    fontSize: 13,
    marginBottom: 2
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500"
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600"
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700"
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "700"
  },
  estimatedBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8
  },
  estimatedLabel: {
    fontSize: 12
  },
  estimatedDate: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4
  }
});
