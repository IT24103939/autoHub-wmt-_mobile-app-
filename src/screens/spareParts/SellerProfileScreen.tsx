import React, { useState, useEffect } from "react";
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
  ActivityIndicator, Alert, Linking, Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { ReviewSection } from "../../components/common/ReviewSection";
import SupplierApiService from "../../services/SupplierApiService";
import { SparePart } from "../../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "SellerProfile">;

interface SupplierProfile {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  joinedDate: string;
  totalParts: number;
}

export function SellerProfileScreen({ route, navigation }: Props) {
  const { colors } = useAppTheme();
  const { sellerId } = route.params;

  const [seller, setSeller] = useState<SupplierProfile | null>(null);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadSellerData();
  }, [sellerId]);

  const loadSellerData = async () => {
    setIsLoading(true);
    try {
      const [profileData, partsData] = await Promise.all([
        SupplierApiService.getSupplierProfile(sellerId),
        SupplierApiService.getSupplierSpareParts(sellerId),
      ]);
      setSeller(profileData);
      setParts(partsData);
    } catch (error) {
      console.error("Error loading seller:", error);
      Alert.alert("Error", "Could not load seller profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = () => {
    setIsFollowing(prev => !prev);
    // Show a short feedback — in production this would persist to backend
    Alert.alert(
      isFollowing ? "Unfollowed" : "Following!",
      isFollowing
        ? `You unfollowed ${seller?.fullName}.`
        : `You are now following ${seller?.fullName}. You'll be notified of new listings.`,
      [{ text: "OK" }]
    );
  };

  const handleContactEmail = () => {
    if (!seller?.email) {
      Alert.alert("No Email", "This seller has not provided a contact email address.");
      return;
    }
    const subject = encodeURIComponent("Inquiry about your spare parts");
    const body = encodeURIComponent(
      `Hello ${seller.fullName},\n\nI found your listing on WMT and would like to inquire about your products.\n\nPlease let me know your availability.\n\nThank you.`
    );
    const mailUrl = `mailto:${seller.email}?subject=${subject}&body=${body}`;
    Linking.openURL(mailUrl).catch(() => {
      Alert.alert("Error", "No email app found on this device. Please contact: " + seller.email);
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading seller profile...</Text>
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="account-off" size={48} color={colors.mutedText} />
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>Seller not found</Text>
      </View>
    );
  }

  const joinedYear = seller.joinedDate
    ? new Date(seller.joinedDate).getFullYear()
    : "N/A";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroAvatar}>
          <MaterialCommunityIcons name="store" size={44} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.heroName} numberOfLines={1}>{seller.fullName}</Text>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#FCD34D" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          <Text style={styles.heroSub}>Spare Parts Supplier</Text>
          {seller.email && (
            <Text style={styles.heroEmail} numberOfLines={1}>{seller.email}</Text>
          )}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: "Parts Listed", value: parts.length.toString(), icon: "package-variant", color: "#4F46E5" },
          { label: "Member Since", value: joinedYear.toString(), icon: "calendar-account", color: "#10B981" },
          { label: "Phone", value: seller.phone ? "Available" : "N/A", icon: "phone", color: "#F59E0B" },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconBox, { backgroundColor: stat.color + "15" }]}>
              <MaterialCommunityIcons name={stat.icon as any} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedText }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: isFollowing ? colors.card : colors.primary,
              borderColor: isFollowing ? colors.primary : colors.primary,
              borderWidth: 1.5,
            }
          ]}
          onPress={handleFollow}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isFollowing ? "account-check" : "account-plus"}
            size={18}
            color={isFollowing ? colors.primary : "white"}
          />
          <Text style={[styles.actionBtnText, { color: isFollowing ? colors.primary : "white" }]}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1.5 }]}
          onPress={handleContactEmail}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="email-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Contact by Email</Text>
        </TouchableOpacity>
      </View>

      {/* Seller Info Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Seller Info</Text>
        {[
          { icon: "account", label: "Full Name", value: seller.fullName },
          { icon: "email", label: "Email", value: seller.email || "Not provided" },
          { icon: "phone", label: "Phone", value: seller.phone || "Not provided" },
          { icon: "calendar", label: "Member Since", value: new Date(seller.joinedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
          { icon: "package-variant", label: "Total Parts", value: `${parts.length} items listed` },
        ].map((row) => (
          <View key={row.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primary + "12" }]}>
              <MaterialCommunityIcons name={row.icon as any} size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.mutedText }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Products by Seller */}
      <View style={styles.productsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Parts by {seller.fullName.split(" ")[0]} ({parts.length})
        </Text>
        {parts.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="package-variant-closed" size={36} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>No parts listed yet</Text>
          </View>
        ) : (
          parts.map((part) => (
            <TouchableOpacity
              key={part.id}
              style={[styles.partRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate("SparePartDetails", { partId: part.id })}
              activeOpacity={0.8}
            >
              {/* Image or placeholder */}
              <View style={[styles.partImageBox, { backgroundColor: colors.background }]}>
                {part.image ? (
                  <Image source={{ uri: part.image }} style={styles.partImage} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons name="cog" size={26} color={colors.primary} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.partName, { color: colors.text }]} numberOfLines={1}>{part.name}</Text>
                <Text style={[styles.partCategory, { color: colors.mutedText }]}>{part.category}</Text>
                <View style={styles.partFooter}>
                  <Text style={[styles.partPrice, { color: colors.primary }]}>Rs {(part.price ?? 0).toLocaleString()}</Text>
                  <View style={[
                    styles.stockPill,
                    { backgroundColor: part.quantity > 0 ? "#10B98115" : "#EF444415" }
                  ]}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: part.quantity > 0 ? "#10B981" : "#EF4444" }}>
                      {part.quantity > 0 ? `${part.quantity} in stock` : "Out of stock"}
                    </Text>
                  </View>
                </View>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedText} />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Reviews */}
      {sellerId && (
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <ReviewSection targetId={sellerId} targetType="SUPPLIER" />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 80 },
  loadingText: { fontSize: 14 },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  heroName: { color: "white", fontSize: 20, fontWeight: "800", flex: 1 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  verifiedText: { color: "#FCD34D", fontSize: 11, fontWeight: "700" },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 3 },
  heroEmail: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 },

  statsRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 15, fontWeight: "800" },
  statLabel: { fontSize: 10, textAlign: "center" },

  actionRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
  },
  actionBtnText: { fontSize: 14, fontWeight: "700" },

  infoCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", padding: 14, paddingBottom: 10 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  infoIcon: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, marginBottom: 1 },
  infoValue: { fontSize: 14, fontWeight: "600" },

  productsSection: { paddingHorizontal: 16, marginTop: 20 },
  emptyBox: { borderRadius: 14, borderWidth: 1, alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14 },

  partRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  partImageBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  partImage: { width: "100%", height: "100%" },
  partName: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  partCategory: { fontSize: 11, marginBottom: 6 },
  partFooter: { flexDirection: "row", alignItems: "center", gap: 8 },
  partPrice: { fontSize: 14, fontWeight: "800" },
  stockPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
});
