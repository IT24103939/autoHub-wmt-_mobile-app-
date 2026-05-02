import React from "react";
import { Modal, View, Text, StyleSheet, ActivityIndicator } from "react-native";

interface LoadingModalProps {
  visible: boolean;
  message?: string;
  backgroundColor?: string;
  textColor?: string;
  spinnerColor?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  message = "Loading...",
  backgroundColor = "#1A1A2E",
  textColor = "#FFFFFF",
  spinnerColor = "#0099FF",
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}>
        <View style={[styles.container, { backgroundColor }]}>
          <ActivityIndicator size="large" color={spinnerColor} />
          <Text style={[styles.message, { color: textColor }]}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 16,
    minWidth: 200,
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
