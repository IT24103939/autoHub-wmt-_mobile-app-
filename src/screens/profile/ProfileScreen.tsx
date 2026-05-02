import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useShop } from "../../hooks/useShop";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

function roleLabel(role: string) {
  if (role === "GARAGE_OWNER") {
    return "Garage Owner";
  }

  if (role === "SUPPLIER") {
    return "Supplier";
  }

  return "User";
}

export function ProfileScreen({ navigation }: Props) {
  const { currentUser, logout, deleteAccount, isLoading } = useAuth();
  const { mode, colors, toggleTheme } = useAppTheme();
  const { appointments, reviews, notifications, cancelAppointment } = useShop();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews" | "notifications">("bookings");

  const userAppointments = appointments.filter((appointment) => appointment.customerId === currentUser?.id);
  const userReviews = reviews.filter((review) => review.customerId === currentUser?.id);
  const userNotifications = notifications.filter((notification) => notification.userId === currentUser?.id);

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account. This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await deleteAccount();
            } catch {
              Alert.alert("Error", "Failed to delete account. Please try again.");
              setDeleteLoading(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text, marginTop: 12 }]}>Loading profile...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Please log in to view your profile</Text>
        <Pressable 
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={logout}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.mutedText }]}>Name</Text>
        <Text style={[styles.value, { color: colors.text }]}>{currentUser?.fullName ?? "N/A"}</Text>

        <Text style={[styles.label, { color: colors.mutedText }]}>Phone</Text>
        <Text style={[styles.value, { color: colors.text }]}>{currentUser?.phone ?? "N/A"}</Text>

        <Text style={[styles.label, { color: colors.mutedText }]}>Role</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {currentUser ? roleLabel(currentUser.role) : "N/A"}
        </Text>
      </View>

      {currentUser?.role === "USER" ? (
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
            <Pressable
              style={[
                styles.tab,
                activeTab === "bookings" && [styles.activeTab, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => setActiveTab("bookings")}
            >
              <Text style={[styles.tabText, { color: activeTab === "bookings" ? colors.primary : colors.mutedText }]}>
                📅 Bookings
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "reviews" && [styles.activeTab, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => setActiveTab("reviews")}
            >
              <Text style={[styles.tabText, { color: activeTab === "reviews" ? colors.primary : colors.mutedText }]}>
                ⭐ Reviews
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "notifications" && [styles.activeTab, { borderBottomColor: colors.primary }]
              ]}
              onPress={() => setActiveTab("notifications")}
            >
              <Text style={[styles.tabText, { color: activeTab === "notifications" ? colors.primary : colors.mutedText }]}>
                🔔 Notifications
              </Text>
            </Pressable>
          </View>

          {activeTab === "bookings" && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Bookings</Text>
              {userAppointments.length === 0 ? (
                <Text style={[styles.emptyStateText, { color: colors.mutedText }]}>No bookings yet.</Text>
              ) : (
                userAppointments.map((appointment) => (
                  <View key={appointment.id} style={[styles.appointmentCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <Text style={[styles.appointmentGarage, { color: colors.text }]}>{appointment.garageName}</Text>
                    <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Service: {appointment.service}</Text>
                    <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Date: {appointment.appointmentDate}</Text>
                    <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Time: {appointment.appointmentTime}</Text>
                    {appointment.notes ? (
                      <Text style={[styles.appointmentMeta, { color: colors.mutedText }]}>Notes: {appointment.notes}</Text>
                    ) : null}
                    <Text style={[styles.appointmentStatus, { color: colors.primary }]}>Status: {appointment.status}</Text>

                    {appointment.status !== "CANCELLED" && (
                      <Pressable
                        style={[styles.cancelButton, { borderColor: colors.danger }]}
                        onPress={() => {
                          Alert.alert(
                            "Cancel Appointment",
                            "Are you sure you want to cancel this appointment?",
                            [
                              { text: "No", style: "cancel" },
                              {
                                text: "Yes, Cancel",
                                style: "destructive",
                                onPress: () => cancelAppointment(appointment.id)
                              }
                            ]
                          );
                        }}
                      >
                        <Text style={[styles.cancelButtonText, { color: colors.danger }]}>Cancel Appointment</Text>
                      </Pressable>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === "reviews" && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Reviews</Text>
              {userReviews.length === 0 ? (
                <Text style={[styles.emptyStateText, { color: colors.mutedText }]}>No reviews yet.</Text>
              ) : (
                userReviews.map((review) => (
                  <View key={review.id} style={[styles.reviewCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <View style={styles.reviewHeader}>
                      <Text style={[styles.reviewGarage, { color: colors.text }]}>{review.garageName}</Text>
                      <Text style={[styles.reviewRating, { color: colors.primary }]}>{'⭐'.repeat(review.rating)}</Text>
                    </View>
                    <Text style={[styles.reviewComment, { color: colors.mutedText }]}>{review.comment}</Text>
                    <Text style={[styles.reviewDate, { color: colors.mutedText }]}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === "notifications" && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Notifications</Text>
              {userNotifications.length === 0 ? (
                <Text style={[styles.emptyStateText, { color: colors.mutedText }]}>No notifications yet.</Text>
              ) : (
                userNotifications.map((notification) => (
                  <View key={notification.id} style={[styles.reviewCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <Text style={[styles.reviewGarage, { color: colors.text }]}>{notification.title}</Text>
                    <Text style={[styles.reviewComment, { color: colors.mutedText }]}>{notification.message}</Text>
                    <Text style={[styles.reviewDate, { color: colors.mutedText }]}>{new Date(notification.createdAt).toLocaleString()}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      ) : null}

      <Pressable
        style={[styles.themeButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.themeButtonText, { color: colors.text }]}>
          Switch To {mode === "light" ? "Black" : "White"} Theme
        </Text>
      </Pressable>

      <View style={[styles.dangerSection, { borderColor: colors.danger, borderWidth: 1 }]}>
        <Text style={[styles.dangerTitle, { color: colors.danger }]}>Danger Zone</Text>
        <Text style={[styles.dangerHint, { color: colors.mutedText }]}>
          Deleting your account is permanent. All data will be lost.
        </Text>
        <Pressable
          style={[styles.deleteButton, { borderColor: colors.danger }, deleteLoading && styles.disabled]}
          onPress={handleDelete}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <Text style={[styles.deleteButtonText, { color: colors.danger }]}>Delete My Account</Text>
          )}
        </Pressable>
      </View>

      {currentUser?.role === "USER" && (
        <>
          <Pressable
            style={[styles.paymentsButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("PaymentMethods")}
          >
            <Text style={[styles.paymentsButtonText, { color: "white" }]}>💳 Manage Payment Methods</Text>
          </Pressable>

          <Pressable
            style={[styles.paymentsButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("CustomerPayments")}
          >
            <Text style={[styles.paymentsButtonText, { color: "white" }]}>📋 View My Payments</Text>
          </Pressable>
        </>
      )}

      <Pressable style={[styles.logoutButton, { backgroundColor: colors.danger }]} onPress={logout}>
        <Text style={[styles.logoutText, { color: colors.dangerText }]}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16
  },
  card: {
    borderWidth: 1,
    borderColor: "#D0D7E2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  label: {
    color: "#667085",
    fontSize: 12,
    marginBottom: 2
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  appointmentCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  appointmentGarage: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4
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
  cancelButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center"
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "700"
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 16
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  activeTab: {
    borderBottomWidth: 2
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600"
  },
  tabContent: {
    marginTop: 8
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  reviewGarage: {
    fontSize: 15,
    fontWeight: "700"
  },
  reviewRating: {
    fontSize: 14
  },
  reviewComment: {
    fontSize: 13,
    marginBottom: 6
  },
  reviewDate: {
    fontSize: 12
  },
  emptyStateText: {
    fontSize: 14
  },
  themeButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10
  },
  themeButtonText: {
    fontWeight: "700"
  },
  paymentsButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10
  },
  paymentsButtonText: {
    fontWeight: "700",
    fontSize: 16
  },
  logoutButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
  },
  logoutText: {
    fontWeight: "700"
  },
  dangerSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6
  },
  dangerHint: {
    fontSize: 12,
    marginBottom: 14
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
  },
  deleteButtonText: {
    fontWeight: "700",
    fontSize: 14
  },
  disabled: {
    opacity: 0.5
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500"
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20
  },
  loginButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center"
  },
  loginButtonText: {
    fontWeight: "700",
    color: "#fff"
  }
});
