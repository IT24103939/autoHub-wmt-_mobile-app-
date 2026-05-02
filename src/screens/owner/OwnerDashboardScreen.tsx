import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Modal, Alert, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useShop } from "../../hooks/useShop";
import { useAppTheme } from "../../hooks/useAppTheme";
import { Appointment } from "../../types/models";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "OwnerHome">;

type Tile = {
  emoji: string;
  label: string;
  description: string;
  onPress: () => void;
  accent?: boolean;
};

export function OwnerDashboardScreen({ navigation }: Props) {
  const { currentUser, logout } = useAuth();
  const { appointments, garages, reviews, confirmAppointment } = useShop();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isServicesModalVisible, setIsServicesModalVisible] = useState(false);
  const [isBookingsModalVisible, setIsBookingsModalVisible] = useState(false);
  const [isReviewsModalVisible, setIsReviewsModalVisible] = useState(false);
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] = useState(false);

  const ownerGarages = garages.filter((garage) => garage.ownerId === currentUser?.id);

  const ownerGarageIds = ownerGarages.map((garage) => garage.id);

  const ownerAppointments = appointments.filter((appointment) =>
    ownerGarageIds.includes(appointment.garageId)
  );

  const ownerReviews = reviews.filter((review) => ownerGarageIds.includes(review.garageId));

  const ownerNotifications = ownerAppointments
    .slice()
    .sort((a, b) => `${b.appointmentDate} ${b.appointmentTime}`.localeCompare(`${a.appointmentDate} ${a.appointmentTime}`))
    .map((appointment) => ({
      id: appointment.id,
      title: `${appointment.customerName} booked ${appointment.service}`,
      subtitle: `${appointment.garageName} • ${appointment.appointmentDate} ${appointment.appointmentTime}`,
      status: appointment.status
    }));

  const ownerServicesCount = ownerGarages.reduce(
    (total, garage) => total + garage.services.length,
    0
  );

  const statusBarOffset = Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const headerIconTop = statusBarOffset + 6;

  const tiles: Tile[] = [
    {
      emoji: "🏪",
      label: "Edit Garage",
      description: "Update location, hours, services and details",
      onPress: () => navigation.navigate("GarageEdit"),
      accent: true
    },
    {
      emoji: "⚙️",
      label: "Account Settings",
      description: "Update your name, phone and password",
      onPress: () => navigation.navigate("AccountTab" as any)
    },
    {
      emoji: "👤",
      label: "Profile",
      description: "View your account information",
      onPress: () => navigation.navigate("BrowseTab" as any)
    },
    {
      emoji: "🔔",
      label: "Notifications",
      description: "Stay updated on orders and requests",
      onPress: () => setIsNotificationsModalVisible(true)
    }
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Dynamic Header */}
      <View style={[styles.header, { paddingTop: statusBarOffset + 8 }]}>
        <Text style={[styles.dashboardTitle, { color: colors.text }]}>Dashboard</Text>

        <View style={styles.headerIcons}>
          <Pressable
            style={[
              styles.iconButton,
              { borderColor: colors.border, backgroundColor: colors.card }
            ]}
            onPress={() => setIsNotificationsModalVisible(true)}
            accessibilityLabel="Open notifications"
          >
            <Text style={styles.iconEmoji}>🔔</Text>
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              { borderColor: colors.border, backgroundColor: colors.card }
            ]}
            onPress={() => navigation.navigate("BrowseTab" as any)}
            accessibilityLabel="Open profile"
          >
            <Image
              source={require("../../assets/icons/profile-icon.png")}
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome card */}
        <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.welcomeRole}>Garage Owner</Text>
          <Text style={styles.welcomeName}>Welcome, {currentUser?.fullName ?? "Owner"}</Text>
          <Text style={styles.welcomeSub}>Manage your garage and keep customers satisfied.</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.statBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={() => setIsBookingsModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open bookings details"
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>{ownerAppointments.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Bookings</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.statBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={() => setIsServicesModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open services details"
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>{ownerServicesCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Services</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.statBox,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={() => setIsReviewsModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open reviews details"
          >
            <Text style={[styles.statValue, { color: colors.primary }]}>{ownerReviews.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>Reviews</Text>
          </Pressable>
        </View>

        {/* Feature tiles */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.tilesGrid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.label}
              style={[
                styles.tile,
                { backgroundColor: colors.card, borderColor: tile.accent ? colors.primary : colors.border }
              ]}
              onPress={tile.onPress}
            >
              <Text style={styles.tileEmoji}>{tile.emoji}</Text>
              <Text style={[styles.tileLabel, { color: colors.text }]}>{tile.label}</Text>
              <Text style={[styles.tileDesc, { color: colors.mutedText }]}>{tile.description}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Appointments</Text>
        {ownerAppointments.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No appointments booked for your garage yet.</Text>
          </View>
        ) : (
          ownerAppointments.map((appointment) => (
            <Pressable
              key={appointment.id}
              onPress={() => setSelectedAppointment(appointment)}
              style={({ pressed }) => [
                styles.appointmentCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={[styles.appointmentTitle, { color: colors.text }]}>{appointment.garageName}</Text>
              <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Customer: {appointment.customerName}</Text>
              <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Phone: {appointment.customerPhone}</Text>
              <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Service: {appointment.service}</Text>
              <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Date: {appointment.appointmentDate}</Text>
              <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Time: {appointment.appointmentTime}</Text>
              {appointment.notes ? (
                <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Notes: {appointment.notes}</Text>
              ) : null}
              <Text style={[styles.appointmentStatus, { color: colors.primary }]}>Status: {appointment.status}</Text>
              <Text style={[styles.devHint, { color: colors.mutedText }]}>Tap to view details</Text>
            </Pressable>
          ))
        )}

        {/* Logout */}
        <Pressable style={[styles.logoutButton, { borderColor: colors.danger }]} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* Appointment Details Modal */}
      <Modal
        visible={selectedAppointment !== null}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>📊 Booking Details</Text>
              <Pressable onPress={() => setSelectedAppointment(null)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>✕</Text>
              </Pressable>
            </View>

            {/* Professional Info Section */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.devSection}>
                <Text style={[styles.devLabel, { color: colors.primary }]}>📋 Booking ID</Text>
                <Text style={[styles.devValue, { color: colors.text }]}>{selectedAppointment?.id}</Text>
              </View>

              <View style={styles.devSection}>
                <Text style={[styles.devLabel, { color: colors.primary }]}>👤 Customer Info</Text>
                <Text style={[styles.devValue, { color: colors.text }]}>Name: {selectedAppointment?.customerName}</Text>
                <Text style={[styles.devValue, { color: colors.text }]}>Phone: {selectedAppointment?.customerPhone}</Text>
              </View>

              <View style={styles.devSection}>
                <Text style={[styles.devLabel, { color: colors.primary }]}>⚙️ Appointment Details</Text>
                <Text style={[styles.devValue, { color: colors.text }]}>Service: {selectedAppointment?.service}</Text>
                <Text style={[styles.devValue, { color: colors.text }]}>Date: {selectedAppointment?.appointmentDate}</Text>
                <Text style={[styles.devValue, { color: colors.text }]}>Time: {selectedAppointment?.appointmentTime}</Text>
                <Text style={[styles.devValue, { color: colors.text }]}>Status: {selectedAppointment?.status}</Text>
              </View>

              {selectedAppointment?.notes ? (
                <View style={styles.devSection}>
                  <Text style={[styles.devLabel, { color: colors.primary }]}>📝 Customer Notes</Text>
                  <Text style={[styles.devValue, { color: colors.text }]}>{selectedAppointment.notes}</Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <Pressable
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Alert.alert("Compare Appointments", "View appointments side-by-side to compare details.");
                    setSelectedAppointment(null);
                  }}
                >
                  <Text style={styles.actionButtonText}>🔀 Compare</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => {
                    if (!selectedAppointment) {
                      return;
                    }

                    if (selectedAppointment.status === "CONFIRMED") {
                      Alert.alert("Already Confirmed", "This appointment is already confirmed.");
                      return;
                    }

                    confirmAppointment(selectedAppointment.id, currentUser?.fullName);
                    Alert.alert("Booking Confirmed", "Customer has been notified about the confirmation.");
                    setSelectedAppointment(null);
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>✓ Confirm</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.closeDetailsButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setSelectedAppointment(null)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Services Details Modal */}
      <Modal visible={isServicesModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Services Details</Text>
              <Pressable onPress={() => setIsServicesModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.serviceSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.serviceSummaryLabel, { color: colors.mutedText }]}>Total Services</Text>
                <Text style={[styles.serviceSummaryValue, { color: colors.primary }]}>{ownerServicesCount}</Text>
              </View>

              {ownerGarages.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>No garage found for this owner.</Text>
                </View>
              ) : (
                ownerGarages.map((garage) => (
                  <View
                    key={garage.id}
                    style={[styles.serviceGarageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={styles.serviceGarageHeader}>
                      <Text style={[styles.serviceGarageName, { color: colors.text }]}>{garage.name}</Text>
                      <Text style={[styles.serviceGarageCount, { color: colors.primary }]}>
                        {garage.services.length} service{garage.services.length === 1 ? "" : "s"}
                      </Text>
                    </View>

                    {garage.services.length === 0 ? (
                      <Text style={[styles.serviceEmpty, { color: colors.mutedText }]}>No services added yet.</Text>
                    ) : (
                      garage.services.map((service, index) => (
                        <View key={`${garage.id}-${service}-${index}`} style={styles.serviceItemRow}>
                          <Text style={[styles.serviceBullet, { color: colors.primary }]}>•</Text>
                          <Text style={[styles.serviceItemText, { color: colors.text }]}>{service}</Text>
                        </View>
                      ))
                    )}
                  </View>
                ))
              )}

              <Pressable
                style={[
                  styles.closeDetailsButton,
                  { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                ]}
                onPress={() => setIsServicesModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bookings Details Modal */}
      <Modal visible={isBookingsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Bookings Details</Text>
              <Pressable onPress={() => setIsBookingsModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.serviceSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.serviceSummaryLabel, { color: colors.mutedText }]}>Total Bookings</Text>
                <Text style={[styles.serviceSummaryValue, { color: colors.primary }]}>{ownerAppointments.length}</Text>
              </View>

              {ownerAppointments.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>No bookings yet.</Text>
                </View>
              ) : (
                ownerAppointments.map((appointment) => (
                  <View
                    key={`booking-${appointment.id}`}
                    style={[styles.serviceGarageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={[styles.serviceGarageName, { color: colors.text }]}>{appointment.customerName}</Text>
                    <Text style={[styles.serviceItemText, { color: colors.mutedText }]}>Service: {appointment.service}</Text>
                    <Text style={[styles.serviceItemText, { color: colors.mutedText }]}>Date: {appointment.appointmentDate} at {appointment.appointmentTime}</Text>
                    <Text style={[styles.serviceItemText, { color: colors.mutedText }]}>Status: {appointment.status}</Text>
                  </View>
                ))
              )}

              <Pressable
                style={[
                  styles.closeDetailsButton,
                  { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                ]}
                onPress={() => setIsBookingsModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reviews Details Modal */}
      <Modal visible={isReviewsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Reviews Details</Text>
              <Pressable onPress={() => setIsReviewsModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.serviceSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.serviceSummaryLabel, { color: colors.mutedText }]}>Total Reviews</Text>
                <Text style={[styles.serviceSummaryValue, { color: colors.primary }]}>{ownerReviews.length}</Text>
              </View>

              {ownerReviews.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>No reviews yet for your garages.</Text>
                </View>
              ) : (
                ownerReviews.map((review) => (
                  <View
                    key={`review-${review.id}`}
                    style={[styles.serviceGarageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={[styles.serviceGarageName, { color: colors.text }]}>{review.customerName}</Text>
                    <Text style={[styles.serviceItemText, { color: colors.mutedText }]}>Garage: {review.garageName}</Text>
                    <Text style={[styles.serviceItemText, { color: colors.mutedText }]}>Rating: {review.rating}/5</Text>
                    <Text style={[styles.serviceItemText, { color: colors.mutedText }]}>"{review.comment}"</Text>
                  </View>
                ))
              )}

              <Pressable
                style={[
                  styles.closeDetailsButton,
                  { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                ]}
                onPress={() => setIsReviewsModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={isNotificationsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
              <Pressable onPress={() => setIsNotificationsModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {ownerNotifications.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>No notifications yet.</Text>
                </View>
              ) : (
                ownerNotifications.map((notification) => (
                  <View
                    key={`notif-${notification.id}`}
                    style={[styles.serviceGarageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={[styles.serviceGarageName, { color: colors.text }]}>{notification.title}</Text>
                    <Text style={[styles.serviceItemText, { color: colors.mutedText }]}>{notification.subtitle}</Text>
                    <Text style={[styles.serviceItemText, { color: colors.primary }]}>Status: {notification.status}</Text>
                  </View>
                ))
              )}

              <Pressable
                style={[
                  styles.closeDetailsButton,
                  { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                ]}
                onPress={() => setIsNotificationsModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  scroll: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: "800"
  },
  headerIcons: {
    flexDirection: "row",
    gap: 10
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  iconEmoji: {
    fontSize: 18
  },
  profileIcon: {
    width: 20,
    height: 20
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  welcomeRole: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6
  },
  welcomeName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4
  },
  welcomeSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 12
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800"
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24
  },
  tile: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16
  },
  tileEmoji: {
    fontSize: 28,
    marginBottom: 8
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4
  },
  tileDesc: {
    fontSize: 11,
    lineHeight: 15
  },
  appointmentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },
  appointmentTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6
  },
  appointmentMeta: {
    fontSize: 13,
    marginBottom: 2
  },
  appointmentStatus: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6
  },
  devHint: {
    fontSize: 11,
    marginTop: 8,
    fontStyle: "italic"
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24
  },
  emptyText: {
    fontSize: 13
  },
  logoutButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center"
  },
  logoutText: {
    fontWeight: "700",
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 20
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "600"
  },
  modalBody: {
    padding: 16
  },
  devSection: {
    marginBottom: 18
  },
  devLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8
  },
  devValue: {
    fontSize: 13,
    marginBottom: 4,
    paddingLeft: 8,
    fontFamily: "Courier New"
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 12
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14
  },
  closeDetailsButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8
  },
  closeDetailsButtonText: {
    fontWeight: "700",
    fontSize: 14
  },
  serviceSummaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },
  serviceSummaryLabel: {
    fontSize: 12,
    fontWeight: "600"
  },
  serviceSummaryValue: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4
  },
  serviceGarageCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },
  serviceGarageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 10
  },
  serviceGarageName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1
  },
  serviceGarageCount: {
    fontSize: 12,
    fontWeight: "700"
  },
  serviceEmpty: {
    fontSize: 13
  },
  serviceItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4
  },
  serviceBullet: {
    marginRight: 6,
    fontSize: 14,
    lineHeight: 20
  },
  serviceItemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20
  }
});
