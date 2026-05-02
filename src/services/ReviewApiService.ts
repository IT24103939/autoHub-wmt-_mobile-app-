import { apiClient } from "./ApiClient";

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  targetId: string;
  targetType: "GARAGE" | "SUPPLIER";
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

class ReviewApiService {
  async getReviewsByTarget(targetId: string): Promise<Review[]> {
    try {
      return await apiClient.get<Review[]>(`/reviews/target/${targetId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyReviews(): Promise<Review[]> {
    try {
      return await apiClient.get<Review[]>(`/reviews/author`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addReview(payload: {
    targetId: string;
    targetType: "GARAGE" | "SUPPLIER";
    rating: number;
    comment: string;
    authorName: string;
  }): Promise<Review> {
    try {
      return await apiClient.post<Review>("/reviews", payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateReview(id: string, payload: { rating: number; comment: string }): Promise<Review> {
    try {
      return await apiClient.put<Review>(`/reviews/${id}`, payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      await apiClient.delete(`/reviews/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error && typeof error === "object" && "message" in error) {
      return error as Error;
    }
    return new Error(error?.message || "Unknown error occurred");
  }
}

export default new ReviewApiService();
