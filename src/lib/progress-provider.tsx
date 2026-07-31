"use client";

/**
 * LEARNER PROGRESS PROVIDER
 * =========================
 * The single React entry point to learner state. Components never read or
 * write storage directly — they call `useLearnerProgress()`.
 *
 * Hydration: the server renders with empty state and `status: "loading"`, then
 * the client loads persisted state in an effect. Components render course
 * content immediately and gate only the *progress* chrome on `status`, which is
 * also the brief's "Progress loading" edge state (Section 32).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { Module, QuizData, QuizQuestion } from "@/data/course-content";
import {
  learnerReducer,
  type LearnerAction,
  type OptionIndex,
} from "@/lib/learner-state";
import {
  STORAGE_KEY,
  createEmptyState,
  createLocalStorageStore,
  type LearnerStateStore,
} from "@/lib/storage";
import type { LearnerState, ModuleRating, QuizRating } from "@/lib/types";

export type ProgressStatus = "loading" | "ready" | "unavailable";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface LearnerActions {
  recordVideoProgress(
    module: Module,
    furthestSeconds: number,
    durationSeconds: number | null,
  ): void;
  completeVideo(module: Module): void;
  startQuiz(module: Module): void;
  selectOption(moduleId: string, optionIndex: OptionIndex): void;
  submitAnswer(module: Module, question: QuizQuestion): void;
  advanceQuestion(moduleId: string): void;
  completeQuiz(module: Module, quiz: QuizData): void;
  abandonQuiz(moduleId: string): void;
  rateQuiz(moduleId: string, rating: QuizRating): void;
  rateModule(moduleId: string, rating: ModuleRating): void;
  resetAll(): void;
}

export interface LearnerProgressContextValue {
  state: LearnerState;
  status: ProgressStatus;
  saveStatus: SaveStatus;
  /** Learner-facing message for the "we couldn't save" recovery state. */
  saveError: string | null;
  retrySave(): void;
  actions: LearnerActions;
}

const LearnerProgressContext = createContext<LearnerProgressContextValue | null>(
  null,
);

const SAVE_DEBOUNCE_MS = 250;

export function LearnerProgressProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  /** Injectable so a server-backed store can replace localStorage later. */
  store?: LearnerStateStore;
}) {
  const storeRef = useRef<LearnerStateStore | null>(store ?? null);
  if (storeRef.current === null) {
    storeRef.current = createLocalStorageStore();
  }

  const [state, dispatch] = useReducer(learnerReducer, null, createEmptyState);
  const [status, setStatus] = useState<ProgressStatus>("loading");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const pendingState = useRef<LearnerState | null>(null);

  /* -- load once on mount ------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;
    const activeStore = storeRef.current;
    if (!activeStore) return;

    activeStore
      .load()
      .then((loaded) => {
        if (cancelled) return;
        if (loaded) dispatch({ type: "hydrate", state: loaded });
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        // Storage is unreadable (private mode, blocked cookies). The app still
        // works for this session; it just can't remember anything.
        setStatus("unavailable");
        setSaveError(
          "This browser is blocking local storage, so progress won’t be saved between visits.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* -- persist on change (debounced) ------------------------------------- */
  const persist = useCallback(async (next: LearnerState) => {
    const activeStore = storeRef.current;
    if (!activeStore) return;
    setSaveStatus("saving");
    try {
      await activeStore.save(next);
      pendingState.current = null;
      setSaveStatus("saved");
      setSaveError(null);
    } catch (error) {
      pendingState.current = next;
      setSaveStatus("error");
      setSaveError(
        error instanceof Error
          ? error.message
          : "We couldn’t save your progress.",
      );
    }
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    const timer = window.setTimeout(() => {
      void persist(state);
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [state, status, persist]);

  const retrySave = useCallback(() => {
    void persist(pendingState.current ?? state);
  }, [persist, state]);

  /* -- keep multiple tabs in step ---------------------------------------- */
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as LearnerState;
        dispatch({ type: "hydrate", state: parsed });
      } catch {
        // Ignore unparseable cross-tab writes.
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const actions = useMemo<LearnerActions>(() => {
    const now = () => new Date().toISOString();
    const send = (action: LearnerAction) => dispatch(action);

    return {
      recordVideoProgress: (module, furthestSeconds, durationSeconds) =>
        send({
          type: "video/progress",
          module,
          furthestSeconds,
          durationSeconds,
          now: now(),
        }),
      completeVideo: (module) =>
        send({ type: "video/complete", module, now: now() }),
      startQuiz: (module) => send({ type: "quiz/start", module, now: now() }),
      selectOption: (moduleId, optionIndex) =>
        send({ type: "quiz/select", moduleId, optionIndex, now: now() }),
      submitAnswer: (module, question) =>
        send({ type: "quiz/submit", module, question, now: now() }),
      advanceQuestion: (moduleId) =>
        send({ type: "quiz/advance", moduleId, now: now() }),
      completeQuiz: (module, quiz) =>
        send({ type: "quiz/complete", module, quiz, now: now() }),
      abandonQuiz: (moduleId) =>
        send({ type: "quiz/abandon", moduleId, now: now() }),
      rateQuiz: (moduleId, rating) =>
        send({ type: "rating/quiz", moduleId, rating, now: now() }),
      rateModule: (moduleId, rating) =>
        send({ type: "rating/module", moduleId, rating, now: now() }),
      resetAll: () => send({ type: "reset" }),
    };
  }, []);

  const value = useMemo<LearnerProgressContextValue>(
    () => ({ state, status, saveStatus, saveError, retrySave, actions }),
    [state, status, saveStatus, saveError, retrySave, actions],
  );

  return (
    <LearnerProgressContext.Provider value={value}>
      {children}
    </LearnerProgressContext.Provider>
  );
}

export function useLearnerProgress(): LearnerProgressContextValue {
  const value = useContext(LearnerProgressContext);
  if (!value) {
    throw new Error(
      "useLearnerProgress must be used inside <LearnerProgressProvider>.",
    );
  }
  return value;
}
