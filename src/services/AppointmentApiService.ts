// Appointment API service

import { apiClient, ApiError } from "./ApiClient";
import { Appointment } from "../types/models";

class AppointmentApiService {
  async bookAppointment(appointment: Omit<Appointment, "id" | "status">): Promise<Appointment> {
    try {
      const payload = {
        ...appointment,
        status: "PENDING"
      };
      return await apiClient.post<Appointment>("/appointments", payload);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      return await apiClient.get<Appointment>(`/appointments/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGarageAppointments(garageId: string): Promise<Appointment[]> {
    try {
      return await apiClient.get<Appointment[]>(`/appointments/garage/${garageId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOwnerAppointments(): Promise<Appointment[]> {
    try {
      return await apiClient.get<Appointment[]>("/appointments/owner/my-appointments");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCustomerAppointments(): Promise<Appointment[]> {
    try {
      return await apiClient.get<Appointment[]>("/appointments/customer/my-appointments");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      return await apiClient.put<Appointment>(`/appointments/${id}`, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    try {
      return await apiClient.patch<Appointment>(`/appointments/${id}/status?status=${encodeURIComponent(status)}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelAppointment(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/appointments/${id}`);
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

export const appointmentApiService = new AppointmentApiService();
