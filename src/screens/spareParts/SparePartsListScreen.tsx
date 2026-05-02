import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useShop } from "../../hooks/useShop";
import { useAppTheme } from "../../hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "SpareParts">;

export function SparePartsListScreen({ navigation }: Props) {
  const { spareParts, suppliers, addToCart, cartItems } = useShop();
  const { colors } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");

  // Show ALL spare parts from suppliers (NOT filtered by garage)
  const visibleParts = spareParts;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredParts = useMemo(() => {
    if (!normalizedSearch) {
      return visibleParts;
    }

    return visibleParts.filter((part) =>
      part.name.toLowerCase().includes(normalizedSearch)
    );
  }, [visibleParts, normalizedSearch]);

  const suppliersByPartName = useMemo(() => {
    const map: Record<string, string[]> = {};

    visibleParts.forEach((part) => {
      const key = part.name.toLowerCase();
      const supplierName = suppliers[part.supplierId] ?? part.supplierId;

      if (!map[key]) {
        map[key] = [];
      }

      if (!map[key].includes(supplierName)) {
        map[key].push(supplierName);
      }
    });

    return map;
  }, [suppliers, visibleParts]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Spare Parts</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Browse and shop spare parts from our suppliers. These are independent products available from multiple suppliers.
      </Text>

      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search spare part name"
        placeholderTextColor={colors.mutedText}
        style={[
          styles.searchInput,
          { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }
        ]}
      />

      {filteredParts.map((part) => {
        const inCart = cartItems.find((item) => item.partId === part.id)?.quantity ?? 0;
        const partSuppliers = suppliersByPartName[part.name.toLowerCase()] ?? [];

        return (
          <Pressable 
            key={part.id} 
            style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("SparePartDetails", { partId: part.id })}
          >
            <Pressable
              style={[styles.cornerCartButton, { backgroundColor: colors.primary }]}
              onPress={(e) => {
                addToCart(part.id);
              }}
            >
              <Text style={[styles.cornerCartText, { color: colors.primaryText }]}>+ Cart {inCart ? `(${inCart})` : ""}</Text>
            </Pressable>

            {/* Product Image */}
            <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
              {part.image ? (
                <Image source={{ uri: part.image }} style={styles.partImage} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="package" size={50} color={colors.mutedText} />
                </View>
              )}
            </View>

            <Text style={[styles.cardTitle, { color: colors.text }]}>{part.name}</Text>
            <Text style={[styles.cardMeta, { color: colors.mutedText }]}>Supplier: {suppliers[part.supplierId] ?? part.supplierId}</Text>
            <Text style={[styles.cardMeta, { color: colors.mutedText }]}>
              Available from: {partSuppliers.join(", ")}
            </Text>
            <Text style={[styles.cardMeta, { color: colors.mutedText }]}>Category: {part.category}</Text>
            <Text style={[styles.cardMeta, { color: colors.mutedText }]}>Stock: {part.quantity}</Text>
            <Text style={[styles.price, { color: colors.primary }]}>Rs. {(part.price ?? 0).toLocaleString()}</Text>
          </Pressable>
        );
      })}

      {filteredParts.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedText }]}>
          No supplier spare parts match your search.
        </Text>
      ) : null}

      <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => navigation.navigate("Garages")}>
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
          Browse Garages
        </Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => navigation.navigate("CartTab" as any)}>
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Go To Cart</Text>
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
    marginBottom: 16,
    color: "#475467"
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15
  },
  card: {
    position: "relative",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    overflow: "hidden"
  },
  imageContainer: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },
  partImage: {
    width: "100%",
    height: "100%"
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  cardMeta: {
    marginBottom: 2
  },
  price: {
    marginTop: 6,
    marginBottom: 2,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A6EBD"
  },
  cornerCartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  cornerCartText: {
    fontSize: 12,
    fontWeight: "700"
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 14
  },
  secondaryButtonText: {
    fontWeight: "600"
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 14
  }
});
