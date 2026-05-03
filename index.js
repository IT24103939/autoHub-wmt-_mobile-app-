import { registerRootComponent } from 'expo';
import App from './App';

/**
 * Global Error Wrapper
 * This handles any catastrophic failures that occur during the initial module loading phase.
 */
try {
  registerRootComponent(App);
} catch (error) {
  console.error("CATASTROPHE: App failed to register root component.", error);
  // Log to a remote service if available, or just rethrow
  throw error;
}
