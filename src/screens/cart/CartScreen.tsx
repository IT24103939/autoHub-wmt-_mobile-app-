import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useShop } from "../../hooks/useShop";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";
import OrderApiService from "../../services/OrderApiService";
import PaymentApiService from "../../services/PaymentApiService";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export function CartScreen({ navigation }: Props) {
  const { selectedGarage, cartEntries, cartTotal, removeFromCart, clearCart } = useShop();
  const { currentUser } = useAuth();
  const { colors } = useAppTheme();
  const [isLoading, setIsLoading] = useState(false);

  const onCheckout = async () => {
    if (cartEntries.length === 0) {
      Alert.alert("Cart is empty", "Add parts before checkout.");
      return;
    }

    if (!currentUser) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Build order items with supplier info
      const orderItems = cartEntries.map((entry) => ({
        partId: entry.part.id,
        supplierId: entry.part.supplierId,
        partName: entry.part.name,
        brand: entry.part.brand || "",
        quantity: entry.quantity,
        unitPrice: entry.part.price,
        subtotal: entry.subtotal
      }));

      const order = await OrderApiService.createOrder(
        orderItems,
        currentUser.fullName,
        currentUser.phone
      );

      // Create payment for the order
      await PaymentApiService.createPayment(order.id, "CARD");

      Alert.alert(
        "Order Created ✓",
        `Your order #${order.id.slice(0, 8).toUpperCase()} for Rs. ${order.totalAmount.toLocaleString()} is ready for payment.\n\nTap 'Go to Payment' to complete payment.`,
        [
          {
            text: "Later",
            onPress: () => {
              clearCart();
              navigation.navigate("BrowseTab" as any);
            }
          },
          {
            text: "Go to Payment",
            onPress: () => {
              clearCart();
              navigation.navigate("AccountTab" as any);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error("Checkout error:", error);
      Alert.alert("Checkout Failed", error.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Cart</Text>

      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Garage: {selectedGarage ? selectedGarage.name : "Not selected"}
      </Text>

      {cartEntries.map((entry) => (
        <View key={entry.part.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{entry.part.name}</Text>
          <Text style={[styles.cardMeta, { color: colors.mutedText }]}>Qty: {entry.quantity}</Text>
          <Text style={[styles.cardMeta, { color: colors.mutedText }]}>
            Unit: Rs. {entry.part.price.toLocaleString()}
          </Text>
          <Text style={[styles.cardSubtotal, { color: colors.primary }]}>
            Subtotal: Rs. {entry.subtotal.toLocaleString()}
          </Text>

          <Pressable
            style={[styles.removeButton, { borderColor: colors.danger, backgroundColor: colors.card }]}
            onPress={() => removeFromCart(entry.part.id)}
          >
            <Text style={[styles.removeButtonText, { color: colors.danger }]}>Remove</Text>
          </Pressable>
        </View>
      ))}

      {cartEntries.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedText }]}>No items in cart.</Text>
      ) : null}

      <View style={[styles.totalCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>Rs. {cartTotal.toLocaleString()}</Text>
      </View>

      <Pressable
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }]}
        onPress={onCheckout}
        disabled={isLoading}
      >
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>
          {isLoading ? "Processing..." : "Checkout"}
        </Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => navigation.navigate("BrowseTab" as any)}>
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Continue Shopping</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#475467",
    marginBottom: 16
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  cardMeta: {
    marginBottom: 2
  },
  cardSubtotal: {
    marginTop: 4,
    marginBottom: 10,
    color: "#0A6EBD",
    fontWeight: "700"
  },
  removeButton: {
    borderWidth: 1,
    borderColor: "#D92D20",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 8
  },
  removeButtonText: {
    fontWeight: "700"
  },
  emptyText: {
    textAlign: "center",
    color: "#667085",
    marginBottom: 12
  },
  totalCard: {
    borderWidth: 1,
    borderColor: "#D0D7E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  totalLabel: {
    fontWeight: "700",
    fontSize: 16
  },
  totalValue: {
    fontWeight: "700",
    fontSize: 16
  },
  primaryButton: {
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10
  },
  primaryButtonText: {
    fontWeight: "700"
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 14
  },
  secondaryButtonText: {
    fontWeight: "600"
  }
});
