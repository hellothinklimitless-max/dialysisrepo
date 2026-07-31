/**
 * PERSISTENCE ADAPTER
 * ===================
 * Brief Section 30 asks for learner state to be separable from content, and
 * README section 3 asks that local persistence be swappable for a real backend
 * "without a rewrite".
 *
 * So the app never touches `localStorage` directly — it talks to this async
 * interface. Swapping in a server-backed store later means writing a second
 * implementation of `LearnerStateStore` and changing one line in the provider.
 * The methods are async today even though localStorage is synchronous, so that
 * swap doesn't ripple into every caller.
 */

import type { LearnerState } from "@/lib/types";

export const STATE_VERSION = 1;
export const STORAGE_KEY = `dialysis-academy:learner-state:v${STATE_VERSION}`;

export interface LearnerStateStore {
  load(): Promise<LearnerState | null>;
  save(state: LearnerState): Promise<void>;
  clear(): Promise<void>;
}

export function createEmptyState(): LearnerState {
  return {
    version: STATE_VERSION,
    modules: {},
    xpEvents: [],
    achievements: [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Structural sanity check. Persisted state is user-writable (it's localStorage),
 * so it is validated rather than trusted — corrupt or hand-edited data is
 * discarded instead of crashing the app mid-quiz.
 */
function isPlausibleState(value: unknown): value is LearnerState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<LearnerState>;
  return (
    typeof candidate.version === "number" &&
    typeof candidate.modules === "object" &&
    candidate.modules !== null &&
    Array.isArray(candidate.xpEvents) &&
    Array.isArray(candidate.achievements)
  );
}

export class StatePersistenceError extends Error {
  readonly cause: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "StatePersistenceError";
    this.cause = cause;
  }
}

export function createLocalStorageStore(
  key: string = STORAGE_KEY,
): LearnerStateStore {
  const available = () => {
    try {
      return typeof window !== "undefined" && Boolean(window.localStorage);
    } catch {
      // Access to localStorage itself throws in some privacy modes.
      return false;
    }
  };

  return {
    async load() {
      if (!available()) return null;
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(key);
      } catch (error) {
        throw new StatePersistenceError("Could not read saved progress.", error);
      }
      if (!raw) return null;

      try {
        const parsed: unknown = JSON.parse(raw);
        if (!isPlausibleState(parsed)) return null;
        // No migrations exist yet; a version mismatch means the key is stale.
        if (parsed.version !== STATE_VERSION) return null;
        return parsed;
      } catch {
        // Corrupt JSON — start clean rather than blocking the learner.
        return null;
      }
    },

    async save(state) {
      if (!available()) {
        throw new StatePersistenceError(
          "This browser is blocking local storage, so progress can’t be saved.",
        );
      }
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        // Most commonly a quota error, or Safari private browsing.
        throw new StatePersistenceError("Could not save your progress.", error);
      }
    },

    async clear() {
      if (!available()) return;
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        throw new StatePersistenceError("Could not clear saved progress.", error);
      }
    },
  };
}

/** Used during SSR and in tests: accepts everything, remembers nothing. */
export function createMemoryStore(initial: LearnerState | null = null): LearnerStateStore {
  let state = initial;
  return {
    async load() {
      return state;
    },
    async save(next) {
      state = next;
    },
    async clear() {
      state = null;
    },
  };
}
