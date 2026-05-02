import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image, ActivityIndicator, FlatList } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";
import SupplierApiService from "../../services/SupplierApiService";
import { SparePart } from "../../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "SupplierInventory">;

export function SupplierInventoryScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { currentUser } = useAuth();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const parts = await SupplierApiService.getMyInventory();
      setSpareParts(parts);
    } catch (error) {
      console.error("Error loading inventory:", error);
      Alert.alert("Error", "Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  };

  const handleDelete = (part: SparePart) => {
    Alert.alert(
      "Delete Spare Part",
      `Are you sure you want to delete "${part.name}"?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await SupplierApiService.deleteSparePart(part.id);
              setSpareParts(spareParts.filter((p) => p.id !== part.id));
              Alert.alert("Success", "Spare part deleted successfully");
            } catch (error) {
              console.error("Error deleting spare part:", error);
              Alert.alert("Error", "Failed to delete spare part");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEdit = (part: SparePart) => {
    navigation.navigate("EditSparePart", { partId: part.id });
  };

  const renderPartItem = ({ item }: { item: SparePart }) => (
    <View style={[styles.partCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Part Image - Larger Display */}
      <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.partImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="package" size={60} color={colors.mutedText} />
            <Text style={[styles.noImageText, { color: colors.mutedText }]}>No Image</Text>
          </View>
        )}
      </View>

      {/* Part Details */}
      <View style={styles.partDetails}>
        <Text style={[styles.partName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.partCategory, { color: colors.textSecondary }]}>{item.category}</Text>
        {item.brand && <Text style={[styles.partBrand, { color: colors.textSecondary }]}>Brand: {item.brand}</Text>}
        {item.description && <Text style={[styles.partDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>}

        {/* Price and Stock */}
        <View style={styles.priceStockRow}>
          <Text style={[styles.price, { color: colors.primary }]}>Rs {(item.price ?? 0).toLocaleString()}</Text>
          <Text style={[styles.stock, { color: item.quantity > 0 ? colors.success : colors.error }]}>
            Stock: {item.quantity}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: `${colors.primary}20` }]}
          onPress={() => handleEdit(item)}
        >
          <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
          <Text style={[styles.actionButtonLabel, { color: colors.primary }]}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}
          onPress={() => handleDelete(item)}
        >
          <MaterialCommunityIcons name="trash-can" size={18} color={colors.error} />
          <Text style={[styles.actionButtonLabel, { color: colors.error }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Inventory</Text>
        <Pressable onPress={() => navigation.navigate("AddSparePart")}>
          <MaterialCommunityIcons name="plus-circle" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {spareParts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant" size={60} color={colors.mutedText} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No spare parts yet</Text>
          <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Add your first spare part to get started</Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("AddSparePart")}
          >
            <Text style={styles.addButtonText}>Add Spare Part</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={spareParts}
          renderItem={renderPartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginLeft: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  partCard: {
    flexDirection: "column",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  imageContainer: {
    width: "100%",
    height: 160,
  },
  partImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 12,
    marginTop: 8,
  },
  partDetails: {
    padding: 12,
  },
  partName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  partCategory: {
    fontSize: 12,
    marginBottom: 2,
  },
  partBrand: {
    fontSize: 12,
    marginBottom: 2,
  },
  partDesc: {
    fontSize: 11,
    marginBottom: 8,
  },
  priceStockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
  },
  stock: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  actionButtonLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
