import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Modal, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useShop } from "../../hooks/useShop";
import { useAppTheme } from "../../hooks/useAppTheme";
import OrderApiService, { Order, SupplierStats } from "../../services/OrderApiService";
import PaymentApiService, { PaymentStats } from "../../services/PaymentApiService";
import SupplierApiService from "../../services/SupplierApiService";

type Props = NativeStackScreenProps<RootStackParamList, "SupplierHome">;

type Tile = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  color: string;
};

export function SupplierDashboardScreen({ navigation }: Props) {
  const { spareParts, setSpareParts, notifications, markNotificationsAsRead } = useShop();
  const { colors } = useAppTheme();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false);
  const [isOrdersModalVisible, setIsOrdersModalVisible] = useState(false);
  const [isAnalyticsModalVisible, setIsAnalyticsModalVisible] = useState(false);
  const [isPaymentsModalVisible, setIsPaymentsModalVisible] = useState(false);
  const [isCustomersModalVisible, setIsCustomersModalVisible] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [supplierOrders, setSupplierOrders] = useState<Order[]>([]);
  const [supplierStats, setSupplierStats] = useState<SupplierStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    totalPaymentsPending: 0,
    totalPaymentsReceived: 0,
    pendingCount: 0,
    paidCount: 0
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Fetch supplier orders and stats when modals open
  useEffect(() => {
    if (isOrdersModalVisible || isAnalyticsModalVisible || isPaymentsModalVisible) {
      if (currentUser) {
        fetchSupplierData();
        if (isPaymentsModalVisible) {
          setIsLoadingPayments(true);
          PaymentApiService.getSupplierStats()
            .then(setPaymentStats)
            .catch(console.error)
            .finally(() => setIsLoadingPayments(false));
        }
      }
    }
  }, [isOrdersModalVisible, isAnalyticsModalVisible, isPaymentsModalVisible, currentUser]);

  // Fetch inventory when inventory modal opens
  useEffect(() => {
    if (isInventoryModalVisible && currentUser) {
      fetchInventory();
    }
  }, [isInventoryModalVisible, currentUser]);

  // Fetch stats on component mount once user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchSupplierStats();
    }
  }, [currentUser]);

  const fetchInventory = async () => {
    setIsLoadingInventory(true);
    try {
      const realParts = await SupplierApiService.getMyInventory();
      setSpareParts(realParts);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const fetchSupplierStats = async () => {
    try {
      const [stats, payments] = await Promise.all([
        OrderApiService.getSupplierStats(),
        PaymentApiService.getSupplierStats()
      ]);
      setSupplierStats(stats);
      setPaymentStats(payments);
    } catch (error) {
      console.error("Error fetching supplier stats:", error);
    }
  };

  const fetchSupplierData = async () => {
    setIsLoadingOrders(true);
    setIsLoadingStats(true);
    try {
      const [orders, stats] = await Promise.all([
        OrderApiService.getSupplierOrders(),
        OrderApiService.getSupplierStats()
      ]);
      setSupplierOrders(orders);
      setSupplierStats(stats);
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    } finally {
      setIsLoadingOrders(false);
      setIsLoadingStats(false);
    }
  };

  const supplierParts = spareParts.filter((part) => part.supplierId === currentUser?.id);
  const totalStock = supplierParts.reduce((sum, part) => sum + part.quantity, 0);
  const totalInventoryValue = supplierParts.reduce((sum, part) => sum + part.price * part.quantity, 0);
  const lowStockParts = supplierParts.filter((part) => part.quantity <= 5);
  const estimatedMonthlyRevenue = supplierParts.reduce((sum, part) => sum + part.price * Math.min(part.quantity, 3), 0);

  const tiles: Tile[] = [
    {
      icon: "plus-circle-outline",
      label: "Add Part",
      description: "List new inventory",
      onPress: () => navigation.navigate("AddSparePart"),
      color: "#4F46E5"
    },
    {
      icon: "package-variant-closed",
      label: "Inventory",
      description: "Manage stock levels",
      onPress: () => setIsInventoryModalVisible(true),
      color: "#10B981"
    },
    {
      icon: "cart-outline",
      label: "Orders",
      description: "Incoming requests",
      onPress: () => setIsOrdersModalVisible(true),
      color: "#F59E0B"
    },
    {
      icon: "cash-multiple",
      label: "Payments",
      description: "Track earnings",
      onPress: () => setIsPaymentsModalVisible(true),
      color: "#10B981"
    },
    {
      icon: "chart-line",
      label: "Analytics",
      description: "Sales performance",
      onPress: () => setIsAnalyticsModalVisible(true),
      color: "#EC4899"
    },
    {
      icon: "account-cog-outline",
      label: "Settings",
      description: "Account & Profile",
      onPress: () => navigation.navigate("AccountTab" as any),
      color: "#6B7280"
    }
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 60 }]}>
        <View>
          <Text style={[styles.dashboardTitle, { color: colors.text }]}>Supplier Hub</Text>
          <Text style={[styles.dateText, { color: colors.mutedText }]}>
            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <Pressable
            style={[
              styles.iconButton,
              { borderColor: colors.border, backgroundColor: colors.card }
            ]}
            onPress={() => {
              markNotificationsAsRead();
              navigation.navigate("AccountTab", { screen: "NotificationsCenter" });
            }}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome card */}
        <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.welcomeRole}>Supplier</Text>
          <Text style={styles.welcomeName}>Welcome, {currentUser?.fullName ?? "Supplier"}</Text>
          <Text style={styles.welcomeSub}>Manage parts inventory and fulfil orders efficiently.</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: "Parts", value: supplierParts.length, icon: "package-variant", color: "#6366F1" },
            { label: "Orders", value: supplierStats.totalOrders, icon: "cart-outline", color: "#10B981" },
            { label: "Revenue", value: `Rs ${Math.round(supplierStats.totalRevenue)}`, icon: "currency-usd", color: "#F59E0B" }
          ].map((item, idx) => (
            <View
              key={idx}
              style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.statIconCircle, { backgroundColor: item.color + "15" }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Feature tiles */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.tilesGrid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.label}
              style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={tile.onPress}
            >
              <View style={[styles.tileIconCircle, { backgroundColor: tile.color + "10" }]}>
                <MaterialCommunityIcons name={tile.icon} size={24} color={tile.color} />
              </View>
              <View>
                <Text style={[styles.tileLabel, { color: colors.text }]}>{tile.label}</Text>
                <Text style={[styles.tileDesc, { color: colors.mutedText }]}>{tile.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable style={[styles.logoutButton, { borderColor: colors.danger }]} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={isInventoryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>My Inventory</Text>
              <Pressable onPress={() => setIsInventoryModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Pressable
                style={[styles.addPartButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setIsInventoryModalVisible(false);
                  navigation.navigate("AddSparePart");
                }}
              >
                <Text style={styles.addPartButtonText}>+ Add New Spare Part</Text>
              </Pressable>

              {isLoadingInventory ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading inventory...</Text>
                </View>
              ) : (
                <>
                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Part Types</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{supplierParts.length}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText, marginTop: 8 }]}>Total Stock Units</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{totalStock}</Text>
                  </View>

                  {supplierParts.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.emptyText, { color: colors.mutedText }]}>No inventory items found for this supplier.</Text>
                    </View>
                  ) : (
                    supplierParts.map((part) => (
                      <View
                        key={part.id}
                        style={[styles.itemCardWithImage, { backgroundColor: colors.card, borderColor: colors.border }]}
                      >
                        {/* Image */}
                        <View style={[styles.itemImageContainer, { backgroundColor: colors.background }]}>
                          {part.image ? (
                            <Image source={{ uri: part.image }} style={styles.itemImage} resizeMode="cover" />
                          ) : (
                            <View style={styles.itemImagePlaceholder}>
                              <MaterialCommunityIcons name="package" size={40} color={colors.mutedText} />
                            </View>
                          )}
                        </View>
                        {/* Details */}
                        <View style={styles.itemDetailsContainer}>
                          <Text style={[styles.itemName, { color: colors.text }]}>{part.name}</Text>
                          <Text style={[styles.itemMeta, { color: colors.mutedText }]}>Category: {part.category}</Text>
                          {part.brand ? (
                            <Text style={[styles.itemMeta, { color: colors.mutedText }]}>Brand: {part.brand}</Text>
                          ) : null}
                          <Text style={[styles.itemMeta, { color: colors.mutedText }]}>Price: Rs {part.price.toFixed(2)}</Text>
                          <Text style={[styles.itemMeta, { color: colors.primary }]}>Stock: {part.quantity}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </>
              )}

              <Pressable
                style={[styles.closeDetailsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsInventoryModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isOrdersModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Orders</Text>
              <Pressable onPress={() => setIsOrdersModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {isLoadingOrders ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading orders...</Text>
                </View>
              ) : (
                <>
                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Total Orders</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{supplierStats.totalOrders}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText, marginTop: 8 }]}>Pending</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{supplierStats.pendingOrders}</Text>
                  </View>

                  {supplierOrders.length === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.emptyText, { color: colors.mutedText }]}>No orders yet. New customer orders will appear here.</Text>
                    </View>
                  ) : (
                    supplierOrders.map((order) => (
                      <View key={order.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                          <Text style={[styles.itemName, { color: colors.text }]}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                          <Text
                            style={[
                              styles.statusBadge,
                              {
                                color: order.status === "DELIVERED" ? "#10B981" : order.status === "PENDING" ? "#F59E0B" : "#6B7280",
                                backgroundColor: order.status === "DELIVERED" ? "#D1FAE5" : order.status === "PENDING" ? "#FEF3C7" : "#F3F4F6"
                              }
                            ]}
                          >
                            {order.status}
                          </Text>
                        </View>
                        <Text style={[styles.itemMeta, { color: colors.mutedText }]}>Customer: {order.customerName}</Text>
                        <Text style={[styles.itemMeta, { color: colors.mutedText }]}>Items: {order.items.length}</Text>
                        <Text style={[styles.itemMeta, { color: colors.primary, fontWeight: "700" }]}>Total: Rs {order.totalAmount.toLocaleString()}</Text>
                      </View>
                    ))
                  )}
                </>
              )}

              <Pressable
                style={[styles.closeDetailsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsOrdersModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isAnalyticsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Analytics</Text>
              <Pressable onPress={() => setIsAnalyticsModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {isLoadingStats ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading analytics...</Text>
                </View>
              ) : (
                <>
                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Total Revenue</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>Rs {supplierStats.totalRevenue.toLocaleString()}</Text>
                  </View>

                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Total Orders</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{supplierStats.totalOrders}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText, marginTop: 8 }]}>Delivered</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{supplierStats.completedOrders}</Text>
                  </View>

                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Total Units Sold</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{supplierStats.totalItems}</Text>
                  </View>

                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Inventory Value</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>Rs {totalInventoryValue.toFixed(2)}</Text>
                  </View>

                  {lowStockParts.length > 0 ? (
                    <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.itemName, { color: colors.text }]}>Low Stock Alerts</Text>
                      {lowStockParts.map((part) => (
                        <Text key={`low-${part.id}`} style={[styles.itemMeta, { color: colors.mutedText }]}>
                          {part.name} - {part.quantity} left
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.emptyText, { color: colors.mutedText }]}>Great! No low-stock items right now.</Text>
                    </View>
                  )}
                </>
              )}

              <Pressable
                style={[styles.closeDetailsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsAnalyticsModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isPaymentsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Payments</Text>
              <Pressable onPress={() => setIsPaymentsModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {isLoadingPayments ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading payments...</Text>
                </View>
              ) : (
                <>
                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Pending Payments to Receive</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>Rs {paymentStats.totalPaymentsPending.toLocaleString()}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText, marginTop: 8 }]}>Orders</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{paymentStats.pendingCount}</Text>
                  </View>

                  <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Total Payments Received</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>Rs {paymentStats.totalPaymentsReceived.toLocaleString()}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.mutedText, marginTop: 8 }]}>Orders</Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>{paymentStats.paidCount}</Text>
                  </View>

                  {paymentStats.pendingCount === 0 ? (
                    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.emptyText, { color: colors.mutedText }]}>Great! No pending payments right now. All payments have been received.</Text>
                    </View>
                  ) : (
                    <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.itemName, { color: colors.text }]}>📌 Reminder: You have {paymentStats.pendingCount} pending payment(s) waiting from customers.</Text>
                      <Text style={[styles.itemMeta, { color: colors.mutedText, marginTop: 8 }]}>Follow up with customers to complete their payments and increase your cash flow.</Text>
                    </View>
                  )}
                </>
              )}

              <Pressable
                style={[styles.closeDetailsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsPaymentsModalVisible(false)}
              >
                <Text style={[styles.closeDetailsButtonText, { color: colors.text }]}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isCustomersModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Customers & Partners</Text>
              <Pressable onPress={() => setIsCustomersModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>X</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={[styles.customerSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>👥 Regular Users</Text>
                <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>Customers who purchase spare parts from your inventory</Text>
                
                <View style={[styles.customerItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.customerName, { color: colors.text }]}>John Smith</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Phone: +92 300 1234567</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Orders: 5</Text>
                  <Text style={[styles.customerAmount, { color: colors.primary }]}>Total Spent: Rs 15,450</Text>
                </View>

                <View style={[styles.customerItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.customerName, { color: colors.text }]}>Ahmed Hassan</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Phone: +92 301 2345678</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Orders: 3</Text>
                  <Text style={[styles.customerAmount, { color: colors.primary }]}>Total Spent: Rs 8,920</Text>
                </View>

                <View style={[styles.customerItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.customerName, { color: colors.text }]}>Fatima Ali</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Phone: +92 321 3456789</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Orders: 2</Text>
                  <Text style={[styles.customerAmount, { color: colors.primary }]}>Total Spent: Rs 5,230</Text>
                </View>
              </View>

              <View style={[styles.customerSection, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>🏢 Garage Owners</Text>
                <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>Partner garages that may use your spare parts</Text>
                
                <View style={[styles.customerItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.customerName, { color: colors.text }]}>Ali's Auto Garage</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Owner: Ali Khan</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Location: Karachi</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Phone: +92 300 9876543</Text>
                  <Text style={[styles.customerAmount, { color: colors.primary }]}>Orders: 12</Text>
                </View>

                <View style={[styles.customerItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.customerName, { color: colors.text }]}>Speed Service Center</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Owner: Muhammad Hassan</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Location: Lahore</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Phone: +92 331 4567890</Text>
                  <Text style={[styles.customerAmount, { color: colors.primary }]}>Orders: 8</Text>
                </View>

                <View style={[styles.customerItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.customerName, { color: colors.text }]}>Premium Car Care</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Owner: Sarim Ahmed</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Location: Islamabad</Text>
                  <Text style={[styles.customerMeta, { color: colors.textSecondary }]}>Phone: +92 345 5678901</Text>
                  <Text style={[styles.customerAmount, { color: colors.primary }]}>Orders: 15</Text>
                </View>
              </View>

              <Pressable
                style={[styles.closeDetailsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setIsCustomersModalVisible(false)}
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
    paddingTop: 80,
    paddingBottom: 40
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "white",
  },
  notifBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
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
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
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
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    justifyContent: "center",
  },
  tileIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    backgroundColor: "rgba(0,0,0,0.5)"
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
  addPartButton: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 16
  },
  addPartButtonText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#fff"
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600"
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 13
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6
  },
  itemMeta: {
    fontSize: 13,
    marginBottom: 2
  },
  closeDetailsButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
  },
  closeDetailsButtonText: {
    fontWeight: "700",
    fontSize: 14
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  customerSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 12
  },
  customerItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6
  },
  customerMeta: {
    fontSize: 12,
    marginBottom: 2
  },
  customerAmount: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6
  },
  itemCardWithImage: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12
  },
  itemImageContainer: {
    width: 100,
    height: 100
  },
  itemImage: {
    width: "100%",
    height: "100%"
  },
  itemImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  itemDetailsContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between"
  }
});
