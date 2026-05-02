import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useAuth } from "../../hooks/useAuth";
import ReviewApiService, { Review } from "../../services/ReviewApiService";

interface ReviewSectionProps {
  targetId: string;
  targetType: "GARAGE" | "SUPPLIER";
}

export function ReviewSection({ targetId, targetType }: ReviewSectionProps) {
  const { colors } = useAppTheme();
  const { currentUser } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [targetId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await ReviewApiService.getReviewsByTarget(targetId);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert("Required", "Please enter a comment");
      return;
    }

    if (!currentUser) {
      Alert.alert("Login Required", "Please log in to leave a review");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReviewId) {
        const updated = await ReviewApiService.updateReview(editingReviewId, { rating, comment });
        setReviews(prev => prev.map(r => r.id === editingReviewId ? updated : r));
      } else {
        const newReview = await ReviewApiService.addReview({
          targetId,
          targetType,
          rating,
          comment,
          authorName: currentUser.fullName
        });
        setReviews(prev => [newReview, ...prev]);
      }
      resetForm();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete your review?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await ReviewApiService.deleteReview(reviewId);
              setReviews(prev => prev.filter(r => r.id !== reviewId));
            } catch (error) {
              Alert.alert("Error", "Failed to delete review");
            }
          }
        }
      ]
    );
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setIsModalVisible(false);
    setEditingReviewId(null);
    setRating(5);
    setComment("");
  };

  const renderStars = (count: number, size = 16, interactive = false) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable 
            key={i} 
            onPress={() => interactive && setRating(i)}
            disabled={!interactive}
          >
            <MaterialCommunityIcons 
              name={i <= count ? "star" : "star-outline"} 
              size={size} 
              color={i <= count ? "#FFC107" : colors.mutedText} 
            />
          </Pressable>
        ))}
      </View>
    );
  };

  const userHasReviewed = reviews.some(r => r.authorId === currentUser?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reviews ({reviews.length})</Text>
        {!userHasReviewed && currentUser && (
          <Pressable 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: "white" }]}>Add Review</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : reviews.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="comment-text-outline" size={40} color={colors.mutedText} />
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>No reviews yet. Be the first to review!</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.reviewHeader}>
              <View style={styles.authorInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{review.authorName[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={[styles.authorName, { color: colors.text }]}>{review.authorName}</Text>
                  <Text style={[styles.date, { color: colors.mutedText }]}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              {renderStars(review.rating)}
            </View>
            <Text style={[styles.comment, { color: colors.text }]}>{review.comment}</Text>
            
            {currentUser?.id === review.authorId && (
              <View style={styles.actionRow}>
                <Pressable onPress={() => handleEditReview(review)} style={styles.actionButton}>
                  <MaterialCommunityIcons name="pencil" size={14} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => handleDeleteReview(review.id)} style={styles.actionButton}>
                  <MaterialCommunityIcons name="delete" size={14} color={colors.danger} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))
      )}

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={resetForm}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingReviewId ? "Edit Review" : "Add Review"}
              </Text>
              <Pressable onPress={resetForm}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Your Rating</Text>
              <View style={styles.starInputContainer}>
                {renderStars(rating, 40, true)}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Your Experience</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border, 
                  color: colors.text 
                }]}
                placeholder="Tell others about your experience..."
                placeholderTextColor={colors.mutedText}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
              />

              <Pressable 
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "700",
    fontSize: 14,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  date: {
    fontSize: 11,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  starInputContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
