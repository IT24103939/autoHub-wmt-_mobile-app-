import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Landing">;

const { width } = Dimensions.get("window");

export function LandingPage({ navigation }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.primary }]}>
          <View style={styles.heroContent}>
            <Text style={[styles.brandName, { color: "white" }]}>🚗 AutoHub</Text>
            <Text style={[styles.tagline, { color: "rgba(255,255,255,0.9)" }]}>
              Your Complete Garage & Spare Parts Solution
            </Text>
          </View>

          {/* Car Illustration */}
          <View style={[styles.carIllustration, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
            <MaterialCommunityIcons name="car-sports" size={120} color="white" />
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
              <MaterialCommunityIcons name="garage" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Find Garages</Text>
            <Text style={[styles.featureDesc, { color: colors.mutedText }]}>
              Discover trusted garages and book appointments
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
              <MaterialCommunityIcons name="auto-fix" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Spare Parts</Text>
            <Text style={[styles.featureDesc, { color: colors.mutedText }]}>
              Browse quality spare parts from verified suppliers
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}20` }]}>
              <MaterialCommunityIcons name="check-circle" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Trusted Network</Text>
            <Text style={[styles.featureDesc, { color: colors.mutedText }]}>
              All partners are verified for quality and reliability
            </Text>
          </View>
        </View>



        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: `${colors.primary}10` }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>500+</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Garages</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>5000+</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Spare Parts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>50K+</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Happy Users</Text>
          </View>
        </View>

        {/* Call to Action Section */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, { color: colors.text }]}>Ready to Get Started?</Text>
          <Text style={[styles.ctaSubtitle, { color: colors.mutedText }]}>
            Find quality garage services and spare parts in minutes
          </Text>

          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>Login</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Create Account</Text>
          </Pressable>
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
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    marginBottom: 20,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  carIllustration: {
    height: 150,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  featuresContainer: {
    paddingHorizontal: 16,
    paddingVertical: 30,
    gap: 16,
  },
  featureCard: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  featureDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  previewSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  partsPreview: {
    flexDirection: "row",
    gap: 12,
  },
  partItem: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  partIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
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
  garagesPreview: {
    gap: 12,
  },
  garageItem: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  garageIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  garageName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 30,
    borderRadius: 16,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  ctaSection: {
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  spacer: {
    height: 20,
  },
});
