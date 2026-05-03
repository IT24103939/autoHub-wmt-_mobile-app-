import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useShop } from "../../hooks/useShop";
import { useAppTheme } from "../../hooks/useAppTheme";
import { garageApiService } from "../../services/GarageApiService";
import { Garage } from "../../types/models";
import { ReviewSection } from "../../components/common/ReviewSection";

type Props = NativeStackScreenProps<RootStackParamList, "GarageDetails">;

export function GarageDetailsScreen({ route, navigation }: Props) {
  const { colors } = useAppTheme();
  const { selectGarage, garages } = useShop();
  const [remoteGarage, setRemoteGarage] = useState<Garage | null>(null);
  const [isLoadingGarage, setIsLoadingGarage] = useState(false);

  const garage = useMemo(
    () => garages.find((item) => item.id === route.params.garageId) ?? remoteGarage,
    [garages, route.params.garageId, remoteGarage]
  );

  useEffect(() => {
    if (garage) {
      return;
    }

    let mounted = true;
    setIsLoadingGarage(true);
    garageApiService
      .getGarageById(route.params.garageId)
      .then((data) => {
        if (mounted) {
          setRemoteGarage(data);
        }
      })
      .catch(() => {
        // Ignore here and keep fallback message below.
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingGarage(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [garage, route.params.garageId]);

  if (isLoadingGarage && !garage) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading garage details...</Text>
      </View>
    );
  }

  if (!garage) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Garage Not Found</Text>
      </View>
    );
  }

  const handleOpenMap = async () => {
    const query = encodeURIComponent(garage.mapQuery || `${garage.address}, ${garage.city}`);
    
    // On Android, use the geo: scheme to open the native Google Maps app directly if available
    // On iOS, use the maps: scheme
    const scheme = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      if (scheme) {
        const supported = await Linking.canOpenURL(scheme);
        if (supported) {
          await Linking.openURL(scheme);
          return;
        }
      }
      
      // Fallback to web URL if native app isn't found or scheme fails
      const webSupported = await Linking.canOpenURL(webUrl);
      if (webSupported) {
        await Linking.openURL(webUrl);
      } else {
        // Absolute fallback - try to open without checking support
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert("Map Error", "Unable to open Google Maps. Please ensure you have a browser or map app installed.");
    }
  };

  const handleBookAppointment = () => {
    selectGarage(garage.id);
    navigation.navigate("AppointmentBooking", { garageId: garage.id });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}> 
        <Text style={styles.heroTitle}>{garage.name}</Text>
        <Text style={styles.heroSubtitle}>{garage.city}</Text>
        <Text style={styles.heroDescription}>{garage.description}</Text>
      </View>

      <View style={[styles.infoCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Garage Information</Text>
        <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Opening Hours</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{garage.openingHours}</Text>

        <Text style={[styles.infoLabel, { color: colors.mutedText }]}>Location</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{garage.address}, {garage.city}</Text>
      </View>

      <View style={[styles.infoCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Services Available</Text>
        {garage.services.map((service) => (
          <View key={service} style={styles.serviceRow}>
            <Text style={[styles.serviceBullet, { color: colors.primary }]}>•</Text>
            <Text style={[styles.serviceText, { color: colors.text }]}>{service}</Text>
          </View>
        ))}
      </View>

      <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleOpenMap}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Open In Google Maps</Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={handleBookAppointment}>
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Book Appointment</Text>
      </Pressable>

      <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => navigation.navigate("SpareParts")}>
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Browse Supplier Parts</Text>
      </Pressable>

      <ReviewSection targetId={garage.id} targetType="GARAGE" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8
  },
  heroDescription: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 20
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8
  },
  serviceBullet: {
    fontSize: 18,
    marginRight: 8,
    lineHeight: 18
  },
  serviceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  primaryButton: {
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10
  },
  primaryButtonText: {
    fontWeight: "700"
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10
  },
  secondaryButtonText: {
    fontWeight: "600"
  }
});
