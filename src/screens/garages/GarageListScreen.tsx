import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useShop } from "../../hooks/useShop";
import { useAppTheme } from "../../hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "UserHome" | "Garages">;

export function GarageListScreen({ navigation }: Props) {
  const { garages } = useShop();
  const { colors } = useAppTheme();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter garages by service name or garage name
  const filteredGarages = useMemo(() => {
    if (!searchTerm.trim()) {
      return garages;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return garages.filter((garage) => {
      // Search by garage name
      const nameMatch = garage.name.toLowerCase().includes(normalizedSearch);

      // Search by service
      const serviceMatch = garage.services.some((service) =>
        service.toLowerCase().includes(normalizedSearch)
      );

      return nameMatch || serviceMatch;
    });
  }, [garages, searchTerm]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Garages</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>Browse garages to view services and book appointments. Garage selection is independent of spare parts shopping.</Text>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.mutedText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by service or garage name..."
          placeholderTextColor={colors.mutedText}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm ? (
          <Pressable onPress={() => setSearchTerm("")}>
            <MaterialCommunityIcons name="close" size={20} color={colors.mutedText} />
          </Pressable>
        ) : null}
      </View>

      {/* Results Count */}
      {searchTerm && (
        <Text style={[styles.resultCount, { color: colors.mutedText }]}>
          Found {filteredGarages.length} garage{filteredGarages.length !== 1 ? "s" : ""} matching "{searchTerm}"
        </Text>
      )}

      {/* Garages List */}
      <View style={styles.listWrap}>
        {filteredGarages.length > 0 ? (
          filteredGarages.map((garage) => {
            return (
              <View
                key={garage.id}
                style={[
                  styles.card,
                  { borderColor: colors.border, backgroundColor: colors.card }
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.text }]}>{garage.name}</Text>
                <Text style={[styles.cardMeta, { color: colors.mutedText }]}>{garage.city}</Text>
                <Text style={[styles.cardMeta, { color: colors.mutedText }]}>{garage.address}</Text>
                <Text style={[styles.cardMeta, { color: colors.mutedText }]}>Hours: {garage.openingHours}</Text>

                {/* Services Display */}
                {garage.services && garage.services.length > 0 && (
                  <View style={styles.servicesContainer}>
                    <Text style={[styles.servicesLabel, { color: colors.mutedText }]}>Services:</Text>
                    <View style={styles.servicesTags}>
                      {garage.services.map((service, index) => (
                        <View
                          key={index}
                          style={[styles.serviceTag, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}
                        >
                          <Text style={[styles.serviceTagText, { color: colors.primary }]}>{service}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* No "Selected" label - just action buttons */}

              <Pressable
                style={[styles.cardActionButton, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={() => navigation.navigate("GarageDetails", { garageId: garage.id })}
              >
                <Text style={[styles.cardActionText, { color: colors.text }]}>View Details</Text>
              </Pressable>

              <Pressable
                style={[styles.cardActionButton, { borderColor: colors.border, backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("AppointmentBooking", { garageId: garage.id })}
              >
                <Text style={[styles.cardActionText, { color: colors.primaryText }]}>Book Appointment</Text>
              </Pressable>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="garage-alert" size={48} color={colors.mutedText} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No garages found</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>Try searching for a different service or garage name</Text>
          </View>
        )}
      </View>

      <Pressable style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => navigation.navigate("Cart")}>
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>View Cart</Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Open Profile</Text>
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
    marginBottom: 8,
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#475467"
  },
  listWrap: {
    marginBottom: 14
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  cardActive: {
    borderColor: "#0A6EBD"
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },
  cardMeta: {
    marginBottom: 2
  },
  activeLabel: {
    marginTop: 6,
    fontWeight: "700"
  },
  cardActionButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10
  },
  cardActionText: {
    fontWeight: "600"
  },
  primaryButton: {
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10
  },
  primaryButtonDisabled: {
    backgroundColor: "#9EB8D1"
  },
  primaryButtonText: {
    fontWeight: "700"
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 10
  },
  secondaryButtonText: {
    fontWeight: "600"
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  servicesContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  servicesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  servicesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  serviceTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  serviceTagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
  }
});
