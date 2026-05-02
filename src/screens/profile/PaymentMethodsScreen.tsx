import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, ActivityIndicator, Alert, TextInput } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import PaymentMethodApiService, { PaymentMethod } from "../../services/PaymentMethodApiService";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export function PaymentMethodsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<"CARD" | "BANK_TRANSFER" | "WALLET">("CARD");
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    cardHolder: "",
    expiryMonth: "",
    expiryYear: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    walletAddress: "",
    walletType: ""
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const data = await PaymentMethodApiService.getPaymentMethods();
      setMethods(data);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!formData.name) {
      Alert.alert("Error", "Please enter a name for this payment method");
      return;
    }

    if (selectedType === "CARD" && (!formData.cardNumber || !formData.cardHolder || !formData.expiryMonth || !formData.expiryYear)) {
      Alert.alert("Error", "Please fill all card details");
      return;
    }

    if (selectedType === "BANK_TRANSFER" && (!formData.bankName || !formData.accountNumber || !formData.accountHolder)) {
      Alert.alert("Error", "Please fill all bank details");
      return;
    }

    if (selectedType === "WALLET" && (!formData.walletType || !formData.walletAddress)) {
      Alert.alert("Error", "Please fill wallet details");
      return;
    }

    setIsSaving(true);
    try {
      const newMethod = await PaymentMethodApiService.addPaymentMethod({
        type: selectedType,
        name: formData.name,
        cardNumber: selectedType === "CARD" ? formData.cardNumber : undefined,
        cardHolder: selectedType === "CARD" ? formData.cardHolder : undefined,
        expiryMonth: selectedType === "CARD" ? parseInt(formData.expiryMonth) : undefined,
        expiryYear: selectedType === "CARD" ? parseInt(formData.expiryYear) : undefined,
        bankName: selectedType === "BANK_TRANSFER" ? formData.bankName : undefined,
        accountNumber: selectedType === "BANK_TRANSFER" ? formData.accountNumber : undefined,
        accountHolder: selectedType === "BANK_TRANSFER" ? formData.accountHolder : undefined,
        walletType: selectedType === "WALLET" ? formData.walletType : undefined,
        walletAddress: selectedType === "WALLET" ? formData.walletAddress : undefined
      });

      setMethods([...methods, newMethod]);
      setIsModalVisible(false);
      resetForm();
      Alert.alert("Success", "Payment method added successfully");
    } catch (error) {
      console.error("Error adding payment method:", error);
      Alert.alert("Error", (error as Error).message || "Failed to add payment method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await PaymentMethodApiService.updatePaymentMethod(id, { isDefault: true });
      setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
      Alert.alert("Success", "Default payment method updated");
    } catch (error) {
      Alert.alert("Error", "Failed to set default payment method");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this payment method?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await PaymentMethodApiService.deletePaymentMethod(id);
            setMethods(methods.filter(m => m.id !== id));
            Alert.alert("Success", "Payment method deleted");
          } catch (error) {
            Alert.alert("Error", "Failed to delete payment method");
          }
        }
      }
    ]);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      cardNumber: "",
      cardHolder: "",
      expiryMonth: "",
      expiryYear: "",
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      walletAddress: "",
      walletType: ""
    });
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "CARD":
        return "credit-card";
      case "BANK_TRANSFER":
        return "bank";
      case "WALLET":
        return "wallet";
      default:
        return "payment";
    }
  };

  const getMethodDisplay = (method: PaymentMethod) => {
    switch (method.type) {
      case "CARD":
        return `${method.cardHolder} - ${method.cardNumber}`;
      case "BANK_TRANSFER":
        return `${method.bankName} - ${method.accountNumber}`;
      case "WALLET":
        return `${method.walletType} - ${method.walletAddress}`;
      default:
        return method.name;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {methods.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No payment methods added yet
              </Text>
            ) : (
              methods.map((method) => (
                <View key={method.id} style={[styles.methodCard, { backgroundColor: colors.card, borderColor: method.isDefault ? colors.primary : colors.border }]}>
                  <View style={styles.methodHeader}>
                    <View style={styles.methodInfo}>
                      <MaterialCommunityIcons name={getMethodIcon(method.type)} size={24} color={colors.primary} />
                      <View style={styles.methodDetails}>
                        <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                        <Text style={[styles.methodType, { color: colors.mutedText }]}>{getMethodDisplay(method)}</Text>
                      </View>
                    </View>
                    {method.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.defaultText, { color: colors.primaryText }]}>Default</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <Pressable
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleSetDefault(method.id)}
                      >
                        <Text style={[styles.actionButtonText, { color: colors.primaryText }]}>Set Default</Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: colors.danger || "#F44336" }]}
                      onPress={() => handleDeleteMethod(method.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: "#FFFFFF" }]}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsModalVisible(true)}
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.primaryText} />
              <Text style={[styles.addButtonText, { color: colors.primaryText }]}>Add Payment Method</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent={false}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setIsModalVisible(false)}>
              <Text style={[styles.closeButton, { color: colors.primary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Payment Method</Text>
            <Pressable onPress={handleAddPaymentMethod} disabled={isSaving}>
              <Text style={[styles.saveButton, { color: isSaving ? colors.mutedText : colors.primary }]}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Method Type Selection */}
            <Text style={[styles.label, { color: colors.text }]}>Payment Type</Text>
            <View style={styles.typeSelection}>
              {["CARD", "BANK_TRANSFER", "WALLET"].map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && { borderColor: colors.primary, borderWidth: 2 },
                    { backgroundColor: colors.card, borderColor: colors.border }
                  ]}
                  onPress={() => setSelectedType(type as any)}
                >
                  <MaterialCommunityIcons
                    name={getMethodIcon(type)}
                    size={24}
                    color={selectedType === type ? colors.primary : colors.mutedText}
                  />
                  <Text style={[styles.typeButtonLabel, { color: selectedType === type ? colors.primary : colors.text }]}>
                    {type.replace("_", " ")}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Common Fields */}
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., My Visa Card"
              placeholderTextColor={colors.mutedText}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            {/* Card Fields */}
            {selectedType === "CARD" && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Card Number (Last 4 Digits)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="1234"
                  placeholderTextColor={colors.mutedText}
                  value={formData.cardNumber}
                  onChangeText={(text) => setFormData({ ...formData, cardNumber: text })}
                  keyboardType="numeric"
                  maxLength={4}
                />

                <Text style={[styles.label, { color: colors.text }]}>Card Holder Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.mutedText}
                  value={formData.cardHolder}
                  onChangeText={(text) => setFormData({ ...formData, cardHolder: text })}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: colors.text }]}>Expiry Month</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                      placeholder="MM"
                      placeholderTextColor={colors.mutedText}
                      value={formData.expiryMonth}
                      onChangeText={(text) => setFormData({ ...formData, expiryMonth: text })}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={[styles.label, { color: colors.text }]}>Expiry Year</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                      placeholder="YY"
                      placeholderTextColor={colors.mutedText}
                      value={formData.expiryYear}
                      onChangeText={(text) => setFormData({ ...formData, expiryYear: text })}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Bank Fields */}
            {selectedType === "BANK_TRANSFER" && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Bank Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g., HBL, UBL"
                  placeholderTextColor={colors.mutedText}
                  value={formData.bankName}
                  onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                />

                <Text style={[styles.label, { color: colors.text }]}>Account Number (Last 4 Digits)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="5678"
                  placeholderTextColor={colors.mutedText}
                  value={formData.accountNumber}
                  onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                  keyboardType="numeric"
                  maxLength={4}
                />

                <Text style={[styles.label, { color: colors.text }]}>Account Holder</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.mutedText}
                  value={formData.accountHolder}
                  onChangeText={(text) => setFormData({ ...formData, accountHolder: text })}
                />
              </>
            )}

            {/* Wallet Fields */}
            {selectedType === "WALLET" && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Wallet Type</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g., JazzCash, Easypaisa"
                  placeholderTextColor={colors.mutedText}
                  value={formData.walletType}
                  onChangeText={(text) => setFormData({ ...formData, walletType: text })}
                />

                <Text style={[styles.label, { color: colors.text }]}>Wallet Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="Your wallet address"
                  placeholderTextColor={colors.mutedText}
                  value={formData.walletAddress}
                  onChangeText={(text) => setFormData({ ...formData, walletAddress: text })}
                />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    marginTop: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 40,
    fontSize: 16
  },
  methodCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  methodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  methodDetails: {
    marginLeft: 12,
    flex: 1
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4
  },
  methodType: {
    fontSize: 13
  },
  defaultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  defaultText: {
    fontSize: 12,
    fontWeight: "600"
  },
  methodActions: {
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center"
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600"
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 40,
    marginTop: 20,
    gap: 8
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600"
  },
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "600"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600"
  },
  modalContent: {
    padding: 16,
    flex: 1
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  typeSelection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    gap: 8
  },
  typeButtonLabel: {
    fontSize: 12,
    fontWeight: "500"
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  halfWidth: {
    flex: 1
  }
});
