import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../hooks/useAuth";
import { useAppTheme } from "../../hooks/useAppTheme";
import SupplierApiService from "../../services/SupplierApiService";
import { SparePart } from "../../types/models";
import { LoadingModal } from "../../components/common/LoadingModal";

type Props = NativeStackScreenProps<RootStackParamList, "EditSparePart">;

export function EditSparePartScreen({ route, navigation }: Props) {
  const { colors } = useAppTheme();
  const { currentUser } = useAuth();
  const { partId } = route.params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [sparePart, setSparePart] = useState<SparePart | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    quantity: "",
    description: "",
  });

  useEffect(() => {
    loadSparePart();
  }, []);

  const loadSparePart = async () => {
    try {
      const part = await SupplierApiService.getSparePartById(partId);
      setSparePart(part);
      setFormData({
        name: part.name,
        category: part.category,
        brand: part.brand || "",
        price: part.price.toString(),
        quantity: part.quantity.toString(),
        description: part.description || "",
      });
      if (part.image) {
        setImageUri(part.image);
      }
    } catch (error) {
      console.error("Error loading spare part:", error);
      Alert.alert("Error", "Failed to load spare part");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photo library to pick an image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsImageLoading(true);
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        setImageUri(result.assets[0].uri);
        setIsImageLoading(false);
      }
    } catch (error) {
      setIsImageLoading(false);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Part name is required");
      return false;
    }
    if (!formData.category.trim()) {
      Alert.alert("Error", "Category is required");
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert("Error", "Valid price is required");
      return false;
    }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity))) {
      Alert.alert("Error", "Valid quantity is required");
      return false;
    }
    return true;
  };

  const handleUpdatePart = async () => {
    if (!validateForm() || !sparePart) return;

    setIsSaving(true);
    try {
      let imageData = imageUri;
      
      // Check if image is a local URI that needs to be converted
      if (imageUri && imageUri.startsWith("file://")) {
        imageData = await convertImageToBase64(imageUri);
      }

      const updates = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        brand: formData.brand.trim() || "",
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        description: formData.description.trim() || "",
        image: imageData,
      };

      await SupplierApiService.updateSparePart(partId, updates);

      Alert.alert("Success", "Spare part updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error updating spare part:", error);
      Alert.alert("Error", error.message || "Failed to update spare part. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Spare Part</Text>
        </View>

        {/* Image Upload */}
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Part Image</Text>
            <Pressable
              style={[styles.imagePicker, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={pickImage}
              disabled={isSaving || isImageLoading}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <View style={styles.imagePickerContent}>
                  <MaterialCommunityIcons name="camera-plus" size={40} color={colors.primary} />
                  <Text style={[styles.imagePickerText, { color: colors.text }]}>Tap to change image</Text>
                </View>
              )}
            </Pressable>
            {imageUri && (
              <Pressable
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={[styles.removeImageText, { color: colors.primary }]}>Remove Image</Text>
              </Pressable>
            )}
          </View>

          {/* Part Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Part Name *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="e.g., Engine Oil Filter"
              placeholderTextColor={colors.mutedText}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              editable={!isSaving}
            />
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="e.g., Engine Parts, Filters, Brakes"
              placeholderTextColor={colors.mutedText}
              value={formData.category}
              onChangeText={(value) => handleInputChange("category", value)}
              editable={!isSaving}
            />
          </View>

          {/* Brand */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Brand</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="e.g., Bosch, Champion, etc."
              placeholderTextColor={colors.mutedText}
              value={formData.brand}
              onChangeText={(value) => handleInputChange("brand", value)}
              editable={!isSaving}
            />
          </View>

          {/* Price */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Price (Rs) *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.mutedText}
              value={formData.price}
              onChangeText={(value) => handleInputChange("price", value)}
              keyboardType="decimal-pad"
              editable={!isSaving}
            />
          </View>

          {/* Quantity */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Quantity in Stock *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.mutedText}
              value={formData.quantity}
              onChangeText={(value) => handleInputChange("quantity", value)}
              keyboardType="number-pad"
              editable={!isSaving}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }, styles.textArea]}
              placeholder="Add any additional details about this part..."
              placeholderTextColor={colors.mutedText}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={4}
              editable={!isSaving}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <Pressable
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 }]}
            onPress={handleUpdatePart}
            disabled={isSaving}
          >
            <Text style={styles.submitButtonText}>{isSaving ? "Saving..." : "Save Changes"}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LoadingModal
        visible={isImageLoading}
        message="Processing image..."
        backgroundColor={colors.card}
        textColor={colors.text}
        spinnerColor={colors.primary}
      />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
    flex: 1,
  },
  form: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imagePickerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  removeImageButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  removeImageText: {
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: "top",
    height: 100,
    paddingTop: 12,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
