import { ApiClient } from "./ApiClient";
import { errorLogger } from "../utils/errorLogger";

export interface AdminStats {
  totalUsers: number;
  totalGarages: number;
  totalAppointments: number;
  totalSuppliers: number;
}

export interface UserManagementData {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
}

class AdminApiServiceClass {
  /**
   * Get system overview statistics
   */
  async getSystemStats(): Promise<AdminStats> {
    try {
      const response = await ApiClient.get<any>("/admin/stats");
      return response;
    } catch (error) {
      errorLogger.log(error, "network", "/admin/stats");
      console.error("Failed to fetch system stats:", error);
      throw error;
    }
  }

  /**
   * Get all users in the system (admin only)
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20
  ): Promise<UserManagementData[]> {
    try {
      const response = await ApiClient.get<any>(`/admin/users?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      errorLogger.log(error, "network", "/admin/users");
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }

  /**
   * Get user details by ID
   */
  async getUserDetail(userId: string): Promise<UserManagementData> {
    try {
      const response = await ApiClient.get<UserManagementData>(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      errorLogger.log(error, "network", `/admin/users/${userId}`);
      console.error("Failed to fetch user detail:", error);
      throw error;
    }
  }

  /**
   * Disable/suspend a user account
   */
  async suspendUser(userId: string, reason: string): Promise<void> {
    try {
      await ApiClient.post(`/admin/users/${userId}/suspend`, { reason });
    } catch (error) {
      errorLogger.log(error, "network", `/admin/users/${userId}/suspend`);
      console.error("Failed to suspend user:", error);
      throw error;
    }
  }

  /**
   * Re-enable/unsuspend a user account
   */
  async unsuspendUser(userId: string): Promise<void> {
    try {
      await ApiClient.post(`/admin/users/${userId}/unsuspend`, {});
    } catch (error) {
      errorLogger.log(error, "network", `/admin/users/${userId}/unsuspend`);
      console.error("Failed to unsuspend user:", error);
      throw error;
    }
  }

  /**
   * Get all garages in the system
   */
  async getAllGarages(page: number = 1, limit: number = 20): Promise<any[]> {
    try {
      const response = await ApiClient.get<any>(
        `/admin/garages?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      errorLogger.log(error, "network", "/admin/garages");
      console.error("Failed to fetch garages:", error);
      throw error;
    }
  }

  /**
   * Get all appointments in the system
   */
  async getAllAppointments(
    page: number = 1,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const response = await ApiClient.get<any>(
        `/admin/appointments?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      throw error;
    }
  }

  /**
   * Get user activity logs
   */
  async getActivityLogs(userId?: string): Promise<any[]> {
    try {
      const query = userId ? `?userId=${userId}` : "";
      const response = await ApiClient.get<any>(`/admin/activity-logs${query}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      throw error;
    }
  }

  /**
   * Generate system report
   */
  async generateReport(reportType: "daily" | "weekly" | "monthly"): Promise<Blob> {
    try {
      const response = await ApiClient.get<any>(`/admin/reports/${reportType}`, {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error;
    }
  }

  /**
   * Update admin profile
   */
  async updateProfile(data: { fullName: string }): Promise<any> {
    try {
      const response = await ApiClient.put<any>("/admin/profile", data);
      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  /**
   * Delete user account with reason notification email
   */
  async deleteUserAccount(userId: string, reason: string): Promise<any> {
    try {
      const response = await ApiClient.post<any>(`/admin/users/${userId}/delete`, {
        reason,
      });
      return response;
    } catch (error) {
      console.error("Failed to delete user account:", error);
      throw error;
    }
  }

  /**
   * Suspend/lock user account
   */
  async suspendUserAccount(userId: string, reason: string): Promise<any> {
    try {
      const response = await ApiClient.post<any>(`/admin/users/${userId}/suspend`, {
        reason,
      });
      return response;
    } catch (error) {
      console.error("Failed to suspend user account:", error);
      throw error;
    }
  }
}

export const AdminApiService = new AdminApiServiceClass();
