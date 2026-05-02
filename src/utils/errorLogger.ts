// Centralized error logging utility

export interface ErrorLog {
  timestamp: string;
  type: "network" | "validation" | "auth" | "server" | "unknown";
  message: string;
  status?: number;
  endpoint?: string;
  stack?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(error: any, type: ErrorLog["type"] = "unknown", endpoint?: string) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      type,
      message: error?.message || String(error),
      status: error?.status,
      endpoint,
      stack: error?.stack
    };

    this.logs.push(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Always log to console
    console.log(`[${type.toUpperCase()}]`, errorLog);

    // Store in localStorage for web, skip for React Native
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem("error_logs", JSON.stringify(this.logs));
      }
    } catch (e) {
      // Silently fail - could be React Native or localStorage unavailable
      // Don't log this to avoid recursive errors
    }

    return errorLog;
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem("error_logs");
      }
    } catch (e) {
      // Silently fail
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();
