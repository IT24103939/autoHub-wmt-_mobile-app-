import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";

interface Notification {
  id: string;
  type: "order" | "appointment" | "promotion" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export function NotificationsCenterScreen() {
  const { colors } = useAppTheme();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "order",
      title: "Order Delivered",
      message: "Your order ORD-001 has been delivered successfully",
      timestamp: "Today at 2:30 PM",
      read: false,
      icon: "package-variant-closed"
    },
    {
      id: "2",
      type: "appointment",
      title: "Appointment Reminder",
      message: "You have an appointment at XYZ Garage tomorrow at 10:00 AM",
      timestamp: "Today at 9:00 AM",
      read: false,
      icon: "calendar-check"
    },
    {
      id: "3",
      type: "promotion",
      title: "Special Offer",
      message: "Get 20% off on all spare parts. Use code SAVE20",
      timestamp: "Yesterday",
      read: true,
      icon: "tag-multiple"
    },
    {
      id: "4",
      type: "system",
      title: "Payment Confirmed",
      message: "Your payment for order ORD-002 has been confirmed",
      timestamp: "2 days ago",
      read: true,
      icon: "check-circle"
    },
    {
      id: "5",
      type: "order",
      title: "Order Confirmed",
      message: "Your order ORD-003 has been confirmed by the seller",
      timestamp: "3 days ago",
      read: true,
      icon: "check-circle"
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const getNotificationColor = (type: string) => {
    const typeColors: Record<string, string> = {
      order: colors.primary,
      appointment: colors.success,
      promotion: "#FF9800",
      system: colors.mutedText
    };
    return typeColors[type] || colors.primary;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        {
          backgroundColor: item.read ? colors.card : colors.accentSurface,
          borderColor: colors.border
        }
      ]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getNotificationColor(item.type) + "20" }
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>

        <View style={styles.textContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            {!item.read && (
              <View
                style={[styles.unreadDot, { backgroundColor: colors.primary }]}
              />
            )}
          </View>
          <Text
            style={[styles.notificationMessage, { color: colors.mutedText }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: colors.mutedText }]}>
            {item.timestamp}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <MaterialCommunityIcons name="close" size={18} color={colors.mutedText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>
            {unreadCount} unread
          </Text>
        </View>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={48}
            color={colors.mutedText}
          />
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>
            No notifications
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700"
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 4
  },
  unreadBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  badgeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  notificationCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1
  },
  notificationContent: {
    flexDirection: "row",
    flex: 1,
    gap: 12
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  textContent: {
    flex: 1
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  notificationMessage: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18
  },
  notificationTime: {
    fontSize: 12
  },
  deleteButton: {
    padding: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12
  }
});
