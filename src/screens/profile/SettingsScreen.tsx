import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAuth } from "../../hooks/useAuth";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const { logout } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            // TODO: Call API to delete account
            Alert.alert("Account Deleted", "Your account has been deleted.", [
              { text: "OK", onPress: () => logout() }
            ]);
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" }
    ]);
  };

  const SettingRow = ({ icon, label, rightElement }: { icon: string; label: string; rightElement: React.ReactNode }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.primary} />
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {rightElement}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <SettingRow
          icon="bell"
          label="Push Notifications"
          rightElement={<Switch value={pushNotifications} onValueChange={setPushNotifications} />}
        />
        <SettingRow
          icon="email"
          label="Email Notifications"
          rightElement={<Switch value={emailNotifications} onValueChange={setEmailNotifications} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <SettingRow
          icon="palette"
          label="Dark Mode"
          rightElement={<Switch value={darkMode} onValueChange={setDarkMode} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <SettingRow
          icon="information"
          label="Version"
          rightElement={<Text style={[styles.versionText, { color: colors.mutedText }]}>1.0.0</Text>}
        />
        <SettingRow
          icon="file-document"
          label="Privacy Policy"
          rightElement={<MaterialCommunityIcons name="chevron-right" size={24} color={colors.mutedText} />}
        />
        <SettingRow
          icon="file-document"
          label="Terms of Service"
          rightElement={<MaterialCommunityIcons name="chevron-right" size={24} color={colors.mutedText} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <TouchableOpacity onPress={handleLogout}>
          <SettingRow
            icon="logout"
            label="Logout"
            rightElement={<MaterialCommunityIcons name="chevron-right" size={24} color={colors.mutedText} />}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteAccount}>
          <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="trash-can" size={24} color={colors.danger} />
              <Text style={[styles.settingLabel, { color: colors.danger }]}>Delete Account</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.mutedText} />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginLeft: 12
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 1,
    borderBottomWidth: 1
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 16
  },
  versionText: {
    fontSize: 14
  }
});
