import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useShop } from "../../hooks/useShop";
import { useAuth } from "../../hooks/useAuth";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export function CheckoutScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { cart, total, placeOrder } = useShop();
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet">("card");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [shippingAddress, setShippingAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const TAX_RATE = 0.1; // 10% tax
  const SHIPPING = 50;
  const tax = total * TAX_RATE;
  const finalTotal = total + tax + SHIPPING - discount;

  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === "SAVE10") {
      setDiscount(total * 0.1);
      Alert.alert("Success", "Promo code applied!");
    } else if (promoCode) {
      Alert.alert("Invalid", "Promo code not found");
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      Alert.alert("Error", "Please enter shipping address");
      return;
    }

    if (!currentUser) {
      Alert.alert("Error", "Please login first");
      return;
    }

    if (paymentMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      Alert.alert("Error", "Please enter complete card details");
      return;
    }

    setIsProcessing(true);
    try {
      // Mock order placement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
      placeOrder();

      Alert.alert("Success", `Order placed! Order ID: ${orderId}`, [
        {
          text: "View Order",
          onPress: () => navigation.navigate("OrderTracking", { orderId })
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentMethodOption = ({
    type,
    label,
    icon
  }: {
    type: "card" | "upi" | "wallet";
    label: string;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.paymentOption,
        {
          backgroundColor: paymentMethod === type ? colors.accentSurface : colors.card,
          borderColor: paymentMethod === type ? colors.primary : colors.border
        }
      ]}
      onPress={() => setPaymentMethod(type)}
    >
      <MaterialCommunityIcons name={icon as any} size={24} color={colors.primary} />
      <Text style={[styles.paymentLabel, { color: colors.text }]}>{label}</Text>
      {paymentMethod === type && (
        <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.label, { color: colors.mutedText }]}>Items ({cart.length})</Text>
            <Text style={[styles.value, { color: colors.text }]}>₹{total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.label, { color: colors.mutedText }]}>Tax (10%)</Text>
            <Text style={[styles.value, { color: colors.text }]}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.label, { color: colors.mutedText }]}>Shipping</Text>
            <Text style={[styles.value, { color: colors.text }]}>₹{SHIPPING.toFixed(2)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.label, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.value, { color: colors.success }]}>-₹{discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹{finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Promo Code */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              placeholder="Enter promo code"
              placeholderTextColor={colors.mutedText}
              value={promoCode}
              onChangeText={setPromoCode}
              style={[styles.promoInput, { borderColor: colors.border, color: colors.text }]}
            />
            <TouchableOpacity
              style={[styles.promoButton, { backgroundColor: colors.primary }]}
              onPress={handleApplyPromo}
            >
              <Text style={[styles.promoButtonText, { color: colors.primaryText }]}>Apply</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.promoHint, { color: colors.mutedText }]}>Try: SAVE10</Text>
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
          <TextInput
            placeholder="Enter complete address"
            placeholderTextColor={colors.mutedText}
            value={shippingAddress}
            onChangeText={setShippingAddress}
            multiline
            textAlignVertical="top"
            style={[
              styles.addressInput,
              { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }
            ]}
          />
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <PaymentMethodOption type="card" label="Card" icon="credit-card" />
            <PaymentMethodOption type="upi" label="UPI" icon="qrcode" />
            <PaymentMethodOption type="wallet" label="Wallet" icon="wallet" />
          </View>

          {paymentMethod === "card" && (
            <View style={styles.cardInputs}>
              <TextInput
                placeholder="Card Number"
                placeholderTextColor={colors.mutedText}
                maxLength={16}
                keyboardType="numeric"
                value={cardDetails.number}
                onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
                style={[
                  styles.input,
                  { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }
                ]}
              />
              <View style={styles.row}>
                <TextInput
                  placeholder="MM/YY"
                  placeholderTextColor={colors.mutedText}
                  maxLength={5}
                  value={cardDetails.expiry}
                  onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
                  style={[
                    { ...styles.input, flex: 1 },
                    { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }
                  ]}
                />
                <TextInput
                  placeholder="CVV"
                  placeholderTextColor={colors.mutedText}
                  maxLength={3}
                  keyboardType="numeric"
                  value={cardDetails.cvv}
                  onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
                  style={[
                    { ...styles.input, flex: 1, marginLeft: 12 },
                    { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: isProcessing ? colors.mutedText : colors.primary }
          ]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Text style={[styles.placeOrderText, { color: colors.primaryText }]}>
            {isProcessing ? "Processing..." : `Place Order (₹${finalTotal.toFixed(2)})`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  label: {
    fontSize: 14
  },
  value: {
    fontSize: 14,
    fontWeight: "600"
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 12
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700"
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700"
  },
  promoContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  promoButton: {
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center"
  },
  promoButtonText: {
    fontWeight: "600",
    fontSize: 14
  },
  promoHint: {
    fontSize: 12,
    marginLeft: 4
  },
  addressInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80
  },
  paymentOptions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  paymentOption: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 8
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: "600"
  },
  cardInputs: {
    gap: 12
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  placeOrderButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: "700"
  }
});
