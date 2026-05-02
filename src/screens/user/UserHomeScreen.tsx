import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useShop } from "../../hooks/useShop";
import { useAuth } from "../../hooks/useAuth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "UserHome">;

export function UserHomeScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const { spareParts, garages } = useShop();
  const { currentUser } = useAuth();

  // Get featured spare parts (first 2)
  const featuredParts = useMemo(() => spareParts.slice(0, 2), [spareParts]);

  // Get top garages by rating
  const topGarages = useMemo(() => {
    return garages.slice(0, 2);
  }, [garages]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.brandName, { color: colors.primary }]}>🚗 AutoHub</Text>
              <Text style={[styles.brandSubtitle, { color: colors.text }]}>Your Garage & Spare Parts Solution</Text>
            </View>
            <Pressable style={[styles.notificationIcon, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="bell" size={20} color={colors.primaryText} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.mutedText} />
            <TextInput
              placeholder="Find Parts or Garages..."
              placeholderTextColor={colors.mutedText}
              style={[styles.searchInput, { color: colors.text }]}
              onFocus={() => navigation.getParent()?.navigate("BrowseTab" as any)}
            />
          </View>
        </View>

        {/* Featured Spare Parts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Spare Parts</Text>
            <Pressable onPress={() => navigation.navigate("SpareParts")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>

          <View style={styles.featuredGrid}>
            {featuredParts.map((part) => (
              <Pressable
                key={part.id}
                style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate("SparePartDetails", { partId: part.id })}
              >
                <View style={[styles.partImagePlaceholder, { backgroundColor: colors.background }]}>
                  {part.image ? (
                    <Image 
                      source={{ uri: part.image }} 
                      style={styles.partImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons name="package" size={40} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.partName, { color: colors.text }]}>{part.name}</Text>
                <Text style={[styles.partPrice, { color: colors.primary }]}>Rs {part.price.toLocaleString()}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Top Garages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Garages</Text>
            <Pressable onPress={() => navigation.navigate("Garages")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>

          <View style={styles.garagesGrid}>
            {topGarages.map((garage) => (
              <Pressable
                key={garage.id}
                style={[styles.garageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate("GarageDetails", { garageId: garage.id })}
              >
                <View style={[styles.garageImagePlaceholder, { backgroundColor: colors.background }]}>
                  <MaterialCommunityIcons name="garage" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.garageName, { color: colors.text }]}>{garage.name}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFA500" />
                  <Text style={[styles.rating, { color: colors.text }]}>4.5</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("AppointmentBooking", { garageId: topGarages[0]?.id || "" })}
          >
            <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primaryText} />
            <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>BOOK APPOINTMENT</Text>
          </Pressable>

          {currentUser?.role === "GARAGE_OWNER" || currentUser?.role === "SUPPLIER" ? (
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: "#FF8C42", borderColor: "#FF8C42" }]}
              onPress={() => {
                if (currentUser?.role === "SUPPLIER") {
                  navigation.navigate("HomeTab" as any);
                } else {
                  navigation.navigate("HomeTab" as any);
                }
              }}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text style={styles.secondaryButtonText}>ADD LISTING</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    padding: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
  },
  featuredGrid: {
    flexDirection: "row",
    gap: 12,
  },
  featureCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  partImagePlaceholder: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  partImage: {
    width: "100%",
    height: "100%",
  },
  partName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  partPrice: {
    fontSize: 13,
    fontWeight: "700",
  },
  garagesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  garageCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  garageImagePlaceholder: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  garageName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  spacer: {
    height: 20,
  },
});
