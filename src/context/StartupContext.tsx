import React, { createContext, useContext, useState, useCallback } from "react";

export interface StartupState {
  isInitialized: boolean;
  progress: number;
  currentTask: string;
  completedTasks: string[];
  errors: string[];
  isLoading: boolean;
}

interface StartupContextType {
  state: StartupState;
  updateProgress: (progress: number, task: string) => void;
  markComplete: () => void;
  addError: (error: string) => void;
  reset: () => void;
}

const initialState: StartupState = {
  isInitialized: false,
  progress: 0,
  currentTask: "准备启动...",
  completedTasks: [],
  errors: [],
  isLoading: true,
};

const StartupContext = createContext<StartupContextType | null>(null);

export const StartupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<StartupState>(initialState);

  const updateProgress = useCallback((progress: number, task: string) => {
    setState((prev) => ({
      ...prev,
      currentTask: task,
      progress,
      completedTasks: prev.completedTasks.includes(task)
        ? prev.completedTasks
        : [...prev.completedTasks, task],
    }));
  }, []);

  const markComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isInitialized: true,
      isLoading: false,
      progress: 100,
      currentTask: "启动完成",
    }));
  }, []);

  const addError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      errors: [...prev.errors, error],
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const value: StartupContextType = {
    state,
    updateProgress,
    markComplete,
    addError,
    reset,
  };

  return (
    <StartupContext.Provider value={value}>{children}</StartupContext.Provider>
  );
};

export const useStartup = (): StartupContextType => {
  const context = useContext(StartupContext);
  if (!context) {
    throw new Error("useStartup must be used within a StartupProvider");
  }
  return context;
};
