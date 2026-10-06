"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PREFERENCES_STORAGE_KEY,
  createEmptyPreferences,
  type UserPreferences,
} from "@/lib/preferences";

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserPreferences;
        setPrefs(parsed);
        if (parsed.displayName) {
          localStorage.setItem("gmv-display-name", parsed.displayName);
        }
      } else {
        setPrefs(null);
      }
    } catch {
      setPrefs(null);
    } finally {
      setReady(true);
    }
  }, []);

  const save = useCallback((next: UserPreferences) => {
    const withTime: UserPreferences = {
      ...next,
      displayName: next.displayName.trim() || "Guest",
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(withTime));
    localStorage.setItem("gmv-display-name", withTime.displayName);
    setPrefs(withTime);
    return withTime;
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    setPrefs(null);
  }, []);

  return {
    prefs,
    ready,
    save,
    clear,
    draftDefaults: prefs ?? createEmptyPreferences(),
  };
}
