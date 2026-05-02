import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useShop } from "../../hooks/useShop";
import { useAppTheme } from "../../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "GarageEdit">;

export function GarageEditScreen({ navigation }: Props) {
  const { currentUser } = useAuth();
  const { garages, updateGarage, createGarage } = useShop();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);

  // Get owner's garage
  const ownerGarage = garages.find((garage) => garage.ownerId === currentUser?.id);
  const isCreating = !ownerGarage;

  const [name, setName] = useState(ownerGarage?.name ?? "");
  const [address, setAddress] = useState(ownerGarage?.address ?? "");
  const [city, setCity] = useState(ownerGarage?.city ?? "");
  const [description, setDescription] = useState(ownerGarage?.description ?? "");
  const [openingHours, setOpeningHours] = useState(ownerGarage?.openingHours ?? "09:00 - 18:00");
  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>(ownerGarage?.services ?? []);
  const [mapQuery, setMapQuery] = useState(ownerGarage?.mapQuery ?? "");

  const handleAddService = () => {
    if (serviceInput.trim()) {
      if (!services.includes(serviceInput.trim())) {
        setServices([...services, serviceInput.trim()]);
        setServiceInput("");
      } else {
        Alert.alert("Duplicate", "This service is already added.");
      }
    }
  };

  const handleRemoveService = (service: string) => {
    setServices(services.filter((s) => s !== service));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Garage name cannot be empty.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Validation Error", "Address cannot be empty.");
      return;
    }
    if (!city.trim()) {
      Alert.alert("Validation Error", "City cannot be empty.");
      return;
    }
    if (!openingHours.trim()) {
      Alert.alert("Validation Error", "Opening hours cannot be empty.");
      return;
    }
    if (services.length === 0) {
      Alert.alert("Validation Error", "Please add at least one service.");
      return;
    }

    setLoading(true);
    try {
      const garageData = {
        name,
        address,
        city,
        description,
        openingHours,
        services,
        mapQuery
      };

      if (isCreating) {
        // Create new garage
        if (!currentUser?.id) {
          Alert.alert("Error", "User ID not found. Please login again.");
          return;
        }
        await createGarage(currentUser.id, garageData);
        Alert.alert("Success", "Garage created successfully.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        // Update existing garage
        await updateGarage(ownerGarage.id, garageData);
        Alert.alert("Success", "Garage details updated successfully.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save garage details.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }];
  const labelStyle = [styles.label, { color: colors.mutedText }];
  const headerTitle = isCreating ? "Create Garage" : "Edit Garage Details";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 80}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} 
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏪 Garage Information</Text>

          <Text style={labelStyle}>Garage Name</Text>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            placeholder="Your garage name"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="words"
          />

          <Text style={labelStyle}>Description</Text>
          <TextInput
            style={[inputStyle, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell customers about your garage (optional)"
            placeholderTextColor={colors.mutedText}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Location</Text>

          <Text style={labelStyle}>Address</Text>
          <TextInput
            style={inputStyle}
            value={address}
            onChangeText={setAddress}
            placeholder="Street address"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="sentences"
          />

          <Text style={labelStyle}>City</Text>
          <TextInput
            style={inputStyle}
            value={city}
            onChangeText={setCity}
            placeholder="City/Town"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="words"
          />

          <Text style={labelStyle}>Google Maps Search Query</Text>
          <TextInput
            style={inputStyle}
            value={mapQuery}
            onChangeText={setMapQuery}
            placeholder="e.g., My Garage City, Landmark Street"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="sentences"
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⏰ Opening Hours</Text>

          <Text style={labelStyle}>Hours Format: HH:MM - HH:MM</Text>
          <TextInput
            style={inputStyle}
            value={openingHours}
            onChangeText={setOpeningHours}
            placeholder="e.g., 08:00 - 18:00"
            placeholderTextColor={colors.mutedText}
          />
          <Text style={[styles.hint, { color: colors.mutedText }]}>Example: 08:00 - 18:00 or 09:00 - 20:00</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔧 Services Offered</Text>

          <View style={styles.serviceInputRow}>
            <TextInput
              style={[inputStyle, styles.serviceInput]}
              value={serviceInput}
              onChangeText={setServiceInput}
              placeholder="Add a service"
              placeholderTextColor={colors.mutedText}
            />
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddService}
              disabled={!serviceInput.trim()}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>

          {services.length > 0 && (
            <View style={styles.servicesList}>
              {services.map((service, index) => (
                <View
                  key={index}
                  style={[
                    styles.serviceChip,
                    { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                >
                  <Text style={styles.serviceText}>{service}</Text>
                  <Pressable
                    onPress={() => handleRemoveService(service)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {services.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.mutedText }]}>
              No services added yet. Add at least one!
            </Text>
          )}
        </View>

        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{isCreating ? "✨ Create Garage" : "💾 Save Garage Details"}</Text>
          )}
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15
  },
  textArea: {
    textAlignVertical: "top",
    paddingVertical: 12
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic"
  },
  serviceInputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  serviceInput: {
    flex: 1
  },
  addButton: {
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700"
  },
  servicesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  serviceChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  serviceText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13
  },
  removeButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700"
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: "italic"
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15
  },
  disabled: {
    opacity: 0.6
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8
  },
  errorSubtext: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center"
  },
  backButton: {
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14
  }
});
