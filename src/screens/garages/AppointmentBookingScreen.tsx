import React, { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useShop } from "../../hooks/useShop";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAuth } from "../../hooks/useAuth";
import { garageApiService } from "../../services/GarageApiService";
import { Garage } from "../../types/models";

type Props = NativeStackScreenProps<RootStackParamList, "AppointmentBooking">;

export function AppointmentBookingScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const { currentUser } = useAuth();
  const { appointments, bookAppointment, selectGarage, garages } = useShop();
  const [remoteGarage, setRemoteGarage] = useState<Garage | null>(null);
  const [isLoadingGarage, setIsLoadingGarage] = useState(false);
  const garage = useMemo(
    () => garages.find((item) => item.id === route.params.garageId) ?? remoteGarage,
    [garages, route.params.garageId, remoteGarage]
  );

  const [service, setService] = useState(garage?.services[0] ?? "");
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [notes, setNotes] = useState("");

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
        // Let fallback UI below handle not-found state.
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

  useEffect(() => {
    if (garage && !service) {
      setService(garage.services[0] ?? "");
    }
  }, [garage, service]);

  if (isLoadingGarage && !garage) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>Loading garage...</Text>
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

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate.trim());

  const slotOptions = useMemo(() => {
    // Fallback to standard hours (09:00 - 18:00) if none are specified
    const hours = garage?.openingHours || "09:00 - 18:00";
    const [openTime, closeTime] = hours.split(" - ");

    if (!openTime || !closeTime) {
      return [];
    }

    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const toLabel = (minutes: number) => {
      const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
      const mins = (minutes % 60).toString().padStart(2, "0");
      return `${hours}:${mins}`;
    };

    const start = toMinutes(openTime);
    const end = toMinutes(closeTime);
    const bookedTimes = appointments
      .filter(
        (appointment) =>
          appointment.garageId === garage.id && appointment.appointmentDate === appointmentDate.trim()
      )
      .map((appointment) => appointment.appointmentTime);

    const slots: string[] = [];
    for (let minutes = start; minutes < end; minutes += 60) {
      const label = toLabel(minutes);
      if (!bookedTimes.includes(label)) {
        slots.push(label);
      }
    }

    return slots;
  }, [appointments, appointmentDate, garage.id, garage.openingHours]);

  useEffect(() => {
    if (appointmentTime && !slotOptions.includes(appointmentTime)) {
      setAppointmentTime("");
    }
  }, [appointmentTime, slotOptions]);

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert("Login Required", "Please log in before booking an appointment.");
      return;
    }

    if (!service.trim() || !appointmentDate.trim() || !appointmentTime.trim()) {
      Alert.alert("Missing Details", "Please choose service, date, and time.");
      return;
    }

    if (!isValidDate) {
      Alert.alert("Invalid Date", "Please enter the date in YYYY-MM-DD format.");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (appointmentDate.trim() < todayStr) {
      Alert.alert("Invalid Date", "You cannot book an appointment for a past date.");
      return;
    }

    if (!slotOptions.includes(appointmentTime)) {
      Alert.alert("Time Slot Unavailable", "Please choose one of the available time slots.");
      return;
    }

    selectGarage(garage.id);
    try {
      await bookAppointment({
        garageId: garage.id,
        garageOwnerId: garage.ownerId,
        garageName: garage.name,
        customerId: currentUser.id,
        customerName: currentUser.fullName,
        customerPhone: currentUser.phone,
        service: service.trim(),
        appointmentDate: appointmentDate.trim(),
        appointmentTime: appointmentTime.trim(),
        notes: notes.trim()
      });

      Alert.alert("Appointment Booked", `Your appointment request for ${garage.name} has been submitted.`, [
        { text: "OK", onPress: () => navigation.navigate("AccountTab" as any) }
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not book this appointment.";
      Alert.alert("Booking Failed", message);
    }
  };

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
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}> 
        <Text style={styles.heroTitle}>{garage.name}</Text>
        <Text style={styles.heroSubtitle}>Book a garage service appointment</Text>
      </View>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.label, { color: colors.mutedText }]}>Choose Service</Text>
        <View style={styles.optionWrap}>
          {garage.services.map((garageService) => {
            const isSelected = service === garageService;

            return (
              <Pressable
                key={garageService}
                style={[
                  styles.optionChip,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.accentSurface : colors.background
                  }
                ]}
                onPress={() => setService(garageService)}
              >
                <Text style={[styles.optionChipText, { color: isSelected ? colors.primary : colors.text }]}>
                  {garageService}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.mutedText }]}>Appointment Date</Text>
        <TextInput
          value={appointmentDate}
          onChangeText={setAppointmentDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.mutedText }]}>Available Time Slots</Text>
        {isValidDate ? (
          slotOptions.length > 0 ? (
            <View style={styles.optionWrap}>
              {slotOptions.map((slot) => {
                const isSelected = appointmentTime === slot;

                return (
                  <Pressable
                    key={slot}
                    style={[
                      styles.optionChip,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.accentSurface : colors.background
                      }
                    ]}
                    onPress={() => setAppointmentTime(slot)}
                  >
                    <Text style={[styles.optionChipText, { color: isSelected ? colors.primary : colors.text }]}>
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.helperText, { color: colors.danger }]}>No available slots for this day.</Text>
          )
        ) : (
          <Text style={[styles.helperText, { color: colors.mutedText }]}>Enter a valid date to see available times.</Text>
        )}

        <Text style={[styles.label, { color: colors.mutedText }]}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe the issue or request"
          placeholderTextColor={colors.mutedText}
          multiline
          textAlignVertical="top"
          style={[styles.textArea, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
        />
      </View>

      <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
        <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Confirm Appointment</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
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
    color: "rgba(255,255,255,0.9)",
    fontSize: 13
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 100
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: "600"
  },
  helperText: {
    fontSize: 13,
    marginTop: 4
  },
  primaryButton: {
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10
  },
  primaryButtonText: {
    fontWeight: "700"
  }
});
