import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "Browse">;

export function BrowseScreen({ navigation }: Props) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>Browse</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        What would you like to explore?
      </Text>

      {/* Browse Garages Card */}
      <Pressable
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("Garages")}
      >
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="garage" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Browse Garages</Text>
        <Text style={[styles.cardDescription, { color: colors.mutedText }]}>
          Find and book services at nearby garages
        </Text>
        <View style={styles.cardFooter}>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.primary} />
        </View>
      </Pressable>

      {/* Browse Spare Parts Card */}
      <Pressable
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("SpareParts")}
      >
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="shopping" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Browse Spare Parts</Text>
        <Text style={[styles.cardDescription, { color: colors.mutedText }]}>
          Shop for automotive spare parts from suppliers
        </Text>
        <View style={styles.cardFooter}>
          <MaterialCommunityIcons name="arrow-right" size={24} color={colors.primary} />
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  cardIcon: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 8,
  },
});
