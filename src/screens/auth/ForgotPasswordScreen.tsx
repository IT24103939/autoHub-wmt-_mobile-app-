import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { authApiService } from "../../services/AuthApiService";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

type Step = "phone" | "email_prompt" | "otp" | "password";

export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async (providedEmail?: string) => {
    if (!phone) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (step === "email_prompt" && (!providedEmail || !providedEmail.includes("@"))) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authApiService.forgotPassword(phone, providedEmail);
      if (response.requiresEmail) {
        Alert.alert("Email Required", response.message);
        setStep("email_prompt");
      } else {
        Alert.alert("Success", response.message + (response.otp ? `\n(Mock OTP: ${response.otp})` : ""));
        setStep("otp");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authApiService.verifyOtp(phone, otp);
      Alert.alert("Success", response.message);
      setStep("password");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authApiService.resetPassword(phone, otp, newPassword);
      Alert.alert("Success", response.message);
      navigation.replace("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (step === "password") setStep("otp");
            else if (step === "otp") setStep("phone");
            else if (step === "email_prompt") setStep("phone");
            else navigation.goBack();
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            {step === "phone"
              ? "Enter your phone number to receive a verification code."
              : step === "email_prompt"
              ? "Your account doesn't have an email. Please enter one to receive the code."
              : step === "otp"
              ? "Enter the verification code sent to your email."
              : "Create a new strong password."}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {step === "phone" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <MaterialCommunityIcons name="phone" size={20} color={colors.mutedText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., 0700000001"
                  placeholderTextColor={colors.mutedText}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!isLoading}
                />
              </View>
            </View>
          )}

          {step === "email_prompt" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Recovery Email Address</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <MaterialCommunityIcons name="email" size={20} color={colors.mutedText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., user@example.com"
                  placeholderTextColor={colors.mutedText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>
            </View>
          )}

          {step === "otp" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <MaterialCommunityIcons name="shield-key" size={20} color={colors.mutedText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter 4-digit code"
                  placeholderTextColor={colors.mutedText}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                  editable={!isLoading}
                />
              </View>
            </View>
          )}

          {step === "password" && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
              <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                <MaterialCommunityIcons name="lock" size={20} color={colors.mutedText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.mutedText}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isLoading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.mutedText}
                  />
                </Pressable>
              </View>
            </View>
          )}

          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]}
            onPress={() => {
              if (step === "phone") handleSendOtp();
              else if (step === "email_prompt") handleSendOtp(email);
              else if (step === "otp") handleVerifyOtp();
              else handleResetPassword();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                {(step === "phone" || step === "email_prompt") ? "Send Code" : step === "otp" ? "Verify Code" : "Reset Password"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
