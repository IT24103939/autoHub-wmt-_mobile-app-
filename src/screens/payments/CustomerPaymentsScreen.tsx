import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, ActivityIndicator, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";
import PaymentApiService, { Payment } from "../../services/PaymentApiService";

type Props = NativeStackScreenProps<RootStackParamList, "CustomerPayments">;

interface PaymentWithGarage extends Payment {
  garageName?: string;
}

export default function CustomerPaymentsScreen({ navigation }: Props) {
  const { currentUser } = useAuth();
  const { colors } = useAppTheme();
  const [payments, setPayments] = useState<PaymentWithGarage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithGarage | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const fetchPayments = async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setIsLoading(true);
    try {
      const customerPayments = await PaymentApiService.getCustomerPayments();
      setPayments(Array.isArray(customerPayments) ? customerPayments : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      if (!silent) Alert.alert("Error", "Failed to load payments");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    // Set up polling for real-time updates (every 10 seconds)
    const intervalId = setInterval(() => {
      fetchPayments(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  const handleProcessPayment = async (payment: PaymentWithGarage) => {
    setIsProcessing(true);
    try {
      await PaymentApiService.processPayment(payment.id);
      Alert.alert("Success", "Payment sent! The supplier will verify it soon.");
      
      // Update local state
      setPayments(payments.map(p => 
        p.id === payment.id ? { ...p, status: "SENT" } : p
      ));
      setIsDetailModalVisible(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentsList = Array.isArray(payments) ? payments : [];
  const pendingPayments = paymentsList.filter(p => p.status === "PENDING");
  const sentPayments = paymentsList.filter(p => p.status === "SENT");
  const paidPayments = paymentsList.filter(p => p.status === "PAID");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return colors.warning || "#FFA500";
      case "SENT":
        return colors.primary || "#3B82F6";
      case "PAID":
        return colors.success || "#4CAF50";
      case "FAILED":
        return colors.danger || "#F44336";
      default:
        return colors.mutedText;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳ Pending";
      case "SENT":
        return "📤 Sent & Awaiting Verification";
      case "PAID":
        return "✓ Verified & Paid";
      case "FAILED":
        return "✗ Failed";
      default:
        return status;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading payments...</Text>
          </View>
        ) : (
          <>
            {/* Pending Payments Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pending Payments ({pendingPayments.length})
              </Text>
              {pendingPayments.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>No pending payments</Text>
                </View>
              ) : (
                pendingPayments.map((payment) => (
                  <Pressable
                    key={payment.id}
                    style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => {
                      setSelectedPayment(payment);
                      setIsDetailModalVisible(true);
                    }}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.paymentAmount, { color: colors.primary }]}>
                          Rs {payment.amount?.toLocaleString() || 0}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(payment.status) + "20" }
                          ]}
                        >
                          <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                            {getStatusBadge(payment.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.cardMeta, { color: colors.mutedText }]}>
                        Order: {payment.orderId?.substring(0, 8)}...
                      </Text>
                      <Text style={[styles.cardMeta, { color: colors.mutedText, marginTop: 4 }]}>
                        Method: {payment.paymentMethod || "Not specified"}
                      </Text>
                    </View>
                    <Text style={[styles.cardArrow, { color: colors.primary }]}>→</Text>
                  </Pressable>
                ))
              )}
            </View>

            {/* Sent Payments Section */}
            {sentPayments.length > 0 && (
              <View style={[styles.section, { marginTop: 24 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Sent Payments ({sentPayments.length})
                </Text>
                {sentPayments.map((payment) => (
                  <Pressable
                    key={payment.id}
                    style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => {
                      setSelectedPayment(payment);
                      setIsDetailModalVisible(true);
                    }}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.paymentAmount, { color: colors.primary }]}>
                          Rs {payment.amount?.toLocaleString() || 0}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(payment.status) + "20" }
                          ]}
                        >
                          <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                            {getStatusBadge(payment.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.cardMeta, { color: colors.mutedText }]}>
                        Order: {payment.orderId?.substring(0, 8)}...
                      </Text>
                    </View>
                    <Text style={[styles.cardArrow, { color: colors.primary }]}>→</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Paid Payments Section */}
            <View style={[styles.section, { marginTop: 24 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Paid Payments ({paidPayments.length})
              </Text>
              {paidPayments.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.emptyText, { color: colors.mutedText }]}>No paid payments yet</Text>
                </View>
              ) : (
                paidPayments.map((payment) => (
                  <Pressable
                    key={payment.id}
                    style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => {
                      setSelectedPayment(payment);
                      setIsDetailModalVisible(true);
                    }}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.paymentAmount, { color: colors.primary }]}>
                          Rs {payment.amount?.toLocaleString() || 0}
                        </Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(payment.status) + "20" }
                          ]}
                        >
                          <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                            {getStatusBadge(payment.status)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.cardMeta, { color: colors.mutedText }]}>
                        Order: {payment.orderId?.substring(0, 8)}...
                      </Text>
                      <Text style={[styles.cardMeta, { color: colors.mutedText, marginTop: 4 }]}>
                        Paid at: {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "N/A"}
                      </Text>
                    </View>
                    <Text style={[styles.cardArrow, { color: colors.primary }]}>→</Text>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Payment Detail Modal */}
      <Modal visible={isDetailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Payment Details</Text>
              <Pressable onPress={() => setIsDetailModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            {selectedPayment && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Amount</Text>
                    <Text style={[styles.detailValue, { color: colors.primary }]}>
                      Rs {selectedPayment.amount?.toLocaleString() || 0}
                    </Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Status</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(selectedPayment.status) + "20" }
                      ]}
                    >
                      <Text style={[styles.statusText, { color: getStatusColor(selectedPayment.status) }]}>
                        {getStatusBadge(selectedPayment.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Order ID</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {selectedPayment.orderId?.substring(0, 12)}...
                    </Text>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Payment Method</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {selectedPayment.paymentMethod || "Not specified"}
                    </Text>
                  </View>

                  {selectedPayment.transactionId && (
                    <>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Transaction ID</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {selectedPayment.transactionId.substring(0, 10)}...
                        </Text>
                      </View>
                    </>
                  )}

                  {selectedPayment.paidAt && (
                    <>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Paid At</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                          {new Date(selectedPayment.paidAt).toLocaleString()}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {selectedPayment.status === "PENDING" && (
                  <Pressable
                    style={[styles.processButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleProcessPayment(selectedPayment)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <ActivityIndicator color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.processButtonText}>Processing...</Text>
                      </>
                    ) : (
                      <Text style={styles.processButtonText}>✓ Mark as Paid</Text>
                    )}
                  </Pressable>
                )}

                <Pressable
                  style={[styles.closeDetailsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setIsDetailModalVisible(false)}
                >
                  <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  paymentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardMeta: {
    fontSize: 12,
  },
  cardArrow: {
    fontSize: 20,
    marginLeft: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  modalBody: {
    padding: 16,
    maxHeight: "75%",
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  processButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    flexDirection: "row",
  },
  processButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeDetailsButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  closeDetailsButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
