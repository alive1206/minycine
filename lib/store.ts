import { createStore } from "jotai";

/**
 * Shared Jotai store used by both the React Provider and
 * non-React code (e.g. auth-fetch.ts).
 *
 * This ensures token state stays in sync between React components
 * and imperative fetch logic.
 */
export const appStore = createStore();
