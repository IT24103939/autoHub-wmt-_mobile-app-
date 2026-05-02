import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useShop } from "../../hooks/useShop";
import SupplierApiService from "../../services/SupplierApiService";
import { SparePart } from "../../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "SparePartDetails">;

export function SparePartDetailsScreen({ route, navigation }: Props) {
  const { colors } = useAppTheme();
  const { partId } = route.params;
  const { addToCart } = useShop();
  const [sparePart, setSparePart] = useState<SparePart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadSparePart();
  }, [partId]);

  const loadSparePart = async () => {
    try {
      const part = await SupplierApiService.getSparePartById(partId);
      setSparePart(part);
    } catch (error) {
      console.error("Error loading spare part:", error);
      Alert.alert("Error", "Failed to load spare part");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!sparePart) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart(sparePart.id);
    }
    
    Alert.alert("Success", `Added ${quantity} item(s) to cart`, [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!sparePart) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Spare part not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Product Image - Shows First */}
        <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
          {sparePart.image ? (
            <Image source={{ uri: sparePart.image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="package" size={80} color={colors.mutedText} />
            </View>
          )}
        </View>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
          </Pressable>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Name and Category */}
          <Text style={[styles.name, { color: colors.text }]}>{sparePart.name}</Text>
          <Text style={[styles.category, { color: colors.textSecondary }]}>{sparePart.category}</Text>

          {/* Brand */}
          {sparePart.brand && (
            <Text style={[styles.brand, { color: colors.textSecondary }]}>Brand: {sparePart.brand}</Text>
          )}

          {/* Price */}
          <Text style={[styles.price, { color: colors.primary }]}>Rs {sparePart.price.toLocaleString()}</Text>

          {/* Stock Status */}
          <View style={[styles.stockContainer, { backgroundColor: sparePart.quantity > 0 ? `${colors.success}15` : `${colors.error}15` }]}>
            <View style={[styles.stockDot, { backgroundColor: sparePart.quantity > 0 ? colors.success : colors.error }]} />
            <Text style={[styles.stockText, { color: sparePart.quantity > 0 ? colors.success : colors.error }]}>
              {sparePart.quantity > 0 ? `${sparePart.quantity} in stock` : "Out of stock"}
            </Text>
          </View>

          {/* Description */}
          {sparePart.description && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>Description</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>{sparePart.description}</Text>
            </View>
          )}

          {/* Specifications */}
          <View style={styles.specsSection}>
            <Text style={[styles.specsTitle, { color: colors.text }]}>Specifications</Text>
            <View style={styles.specRow}>
              <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Category:</Text>
              <Text style={[styles.specValue, { color: colors.text }]}>{sparePart.category}</Text>
            </View>
            {sparePart.brand && (
              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Brand:</Text>
                <Text style={[styles.specValue, { color: colors.text }]}>{sparePart.brand}</Text>
              </View>
            )}
            <View style={styles.specRow}>
              <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Price:</Text>
              <Text style={[styles.specValue, { color: colors.primary }]}>Rs {sparePart.price.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Quantity Selector */}
        {sparePart.quantity > 0 && (
          <View style={[styles.quantityContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.quantityLabel, { color: colors.text }]}>Quantity</Text>
            <View style={[styles.quantitySelector, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
              >
                <Text style={[styles.quantityButtonText, { color: quantity === 1 ? colors.mutedText : colors.primary }]}>−</Text>
              </Pressable>
              <Text style={[styles.quantityValue, { color: colors.text }]}>{quantity}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(sparePart.quantity, quantity + 1))}
                disabled={quantity === sparePart.quantity}
              >
                <Text style={[styles.quantityButtonText, { color: quantity === sparePart.quantity ? colors.mutedText : colors.primary }]}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add to Cart Button */}
      {sparePart.quantity > 0 && (
        <View style={[styles.buttonContainer, { borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
            onPress={handleAddToCart}
          >
            <MaterialCommunityIcons name="cart-plus" size={20} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>
        </View>
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
  errorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  scroll: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    width: "100%",
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "600",
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
  specsSection: {
    marginBottom: 16,
  },
  specsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  specLabel: {
    fontSize: 13,
  },
  specValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  quantityContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
