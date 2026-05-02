import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "SellerProfile">;

export function SellerProfileScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const seller = {
    id: "seller-001",
    name: "AutoParts Express",
    rating: 4.8,
    reviews: 324,
    joinedDate: "2020-05-15",
    description: "Premium automotive spare parts supplier with 4+ years of experience",
    responseTime: "< 2 hours",
    followers: 1250,
    products: 156,
    verified: true
  };

  const products = [
    { id: "1", name: "Engine Air Filter", price: 299, rating: 4.7, sold: 450 },
    { id: "2", name: "Cabin Air Filter", price: 199, rating: 4.5, sold: 320 },
    { id: "3", name: "Oil Filter", price: 149, rating: 4.9, sold: 680 },
    { id: "4", name: "Spark Plugs Set", price: 499, rating: 4.6, sold: 290 }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Seller Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="store" size={40} color={colors.primaryText} />
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.sellerName, { color: colors.text }]}>{seller.name}</Text>
            {seller.verified && (
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.success} />
            )}
          </View>

          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={16} color="#FFC107" />
            <Text style={[styles.rating, { color: colors.text }]}>
              {seller.rating} ({seller.reviews} reviews)
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.mutedText }]}>
            {seller.description}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{seller.products}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Products</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{seller.followers}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Followers</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{seller.responseTime}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>Response Time</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary
            }
          ]}
        >
          <MaterialCommunityIcons name="heart" size={18} color={colors.primaryText} />
          <Text style={[styles.actionButtonText, { color: colors.primaryText }]}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border
            }
          ]}
        >
          <MaterialCommunityIcons name="message" size={18} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Joined</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{seller.joinedDate}</Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.border }]} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="checkmark-circle" size={18} color={colors.success} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Seller Rating</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{seller.rating}/5.0</Text>
          </View>
        </View>
      </View>

      {/* Popular Products */}
      <View style={styles.productsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Products</Text>

        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={[styles.productRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View
              style={[styles.productImage, { backgroundColor: colors.accentSurface }]}
            >
              <MaterialCommunityIcons name="tools" size={24} color={colors.primary} />
            </View>

            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                {product.name}
              </Text>
              <View style={styles.productMeta}>
                <View style={styles.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={12} color="#FFC107" />
                  <Text style={styles.metaText}>{product.rating}</Text>
                </View>
                <Text style={[styles.metaText, { color: colors.mutedText }]}>
                  {product.sold} sold
                </Text>
              </View>
            </View>

            <Text style={[styles.productPrice, { color: colors.primary }]}>
              ₹{product.price}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20
  },
  header: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  headerInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "700"
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6
  },
  rating: {
    fontSize: 13,
    fontWeight: "600"
  },
  description: {
    fontSize: 12,
    lineHeight: 16
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center"
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700"
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600"
  },
  infoSection: {
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12
  },
  infoLabel: {
    fontSize: 12
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2
  },
  divider: {
    borderBottomWidth: 1
  },
  productsSection: {
    paddingHorizontal: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  metaText: {
    fontSize: 11,
    fontWeight: "500"
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700"
  }
});
