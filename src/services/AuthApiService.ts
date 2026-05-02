// Authentication API service

import { apiClient, ApiError } from "./ApiClient";

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  email: string;
  fullName: string;
  password: string;
  role: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

class AuthApiService {
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      return await apiClient.post<LoginResponse>("/auth/login", request);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(request: RegisterRequest): Promise<UserResponse> {
    try {
      return await apiClient.post<UserResponse>("/auth/register", request);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<UserResponse> {
    try {
      return await apiClient.get<UserResponse>("/account/me");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAccount(fullName: string, phone: string, email: string, currentPassword: string, newPassword?: string): Promise<UserResponse> {
    try {
      return await apiClient.put<UserResponse>("/account/me", {
        fullName,
        phone,
        email,
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async setupEmail(email: string): Promise<UserResponse> {
    try {
      return await apiClient.post<UserResponse>("/account/setup-email", { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete<void>("/account/me");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(phone: string, email?: string): Promise<{ message: string; otp?: string; requiresEmail?: boolean }> {
    try {
      return await apiClient.post<{ message: string; otp?: string; requiresEmail?: boolean }>("/auth/forgot-password", { phone, email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<{ message: string }> {
    try {
      return await apiClient.post<{ message: string }>("/auth/verify-otp", { phone, otp });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(phone: string, otp: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await apiClient.post<{ message: string }>("/auth/reset-password", { phone, otp, newPassword });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as ApiError;
      return new Error(apiError.message);
    }
    return error instanceof Error ? error : new Error("Unknown error");
  }
}

export const authApiService = new AuthApiService();
