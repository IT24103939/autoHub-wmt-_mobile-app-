// API configuration and base client for all HTTP calls

import { errorLogger } from "../utils/errorLogger";

import { Platform } from "react-native";

const API_BASE_URL = Platform.OS === "web" ? "http://localhost:8099/api" : "http://10.0.2.2:8099/api";

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

class ApiClientClass {
  private baseURL: string;
  private timeout: number;
  private userToken: string | null = null;
  private userId: string | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  setAuthHeaders(userId: string, token?: string) {
    this.userId = userId;
    if (token) {
      this.userToken = token;
    }
  }

  clearAuth() {
    this.userId = null;
    this.userToken = null;
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...additionalHeaders
    };

    if (this.userId) {
      headers["X-User-Id"] = this.userId;
    }

    if (this.userToken) {
      headers["Authorization"] = `Bearer ${this.userToken}`;
    }

    return headers;
  }

  async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(additionalHeaders);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const options: RequestInit = {
        method,
        headers,
        signal: controller.signal
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseResponse(response);
        throw {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.details
        } as ApiError;
      }

      return await this.parseResponse(response);
    } catch (error: any) {
      // Log all network errors
      errorLogger.log(error, "network", endpoint);
      
      // Only use console.error for actual network failures, not HTTP error responses
      if (error.status) {
        console.log("[API Error]", {
          url,
          method,
          status: error.status,
          error: error?.message || String(error),
          timestamp: new Date().toISOString()
        });
      } else {
        console.error("[Network Error]", {
          url,
          method,
          error: error?.message || String(error),
          timestamp: new Date().toISOString()
        });
      }

      if (error instanceof TypeError) {
        throw {
          status: 0,
          message: "Network error: " + error.message
        } as ApiError;
      }

      // Handle AbortController timeout
      if (error.name === "AbortError") {
        console.error("[Network Timeout]", url);
        throw {
          status: 0,
          message: "Request timeout"
        } as ApiError;
      }

      // Handle other errors
      if (error.status && error.message) {
        throw error; // Already formatted ApiError
      }

      throw {
        status: 0,
        message: error?.message || "Unknown network error"
      } as ApiError;
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const text = await response.text();
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        return text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn("[API] Failed to parse JSON response:", text);
        return { message: text || response.statusText };
      }
    }
    return { message: text || response.statusText };
  }

  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>("GET", endpoint, undefined, headers);
  }

  post<T>(endpoint: string, data: unknown, headers?: Record<string, string>) {
    return this.request<T>("POST", endpoint, data, headers);
  }

  put<T>(endpoint: string, data: unknown, headers?: Record<string, string>) {
    return this.request<T>("PUT", endpoint, data, headers);
  }

  patch<T>(endpoint: string, data?: unknown, headers?: Record<string, string>) {
    return this.request<T>("PATCH", endpoint, data, headers);
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>("DELETE", endpoint, undefined, headers);
  }
}

export const ApiClient = new ApiClientClass();
export const apiClient = ApiClient;
