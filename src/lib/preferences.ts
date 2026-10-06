export type MicPreference = "ok" | "required" | "no";

export type UserPreferences = {
  displayName: string;
  games: string[];
  playstyles: string[];
  mic: MicPreference;
  updatedAt: string;
};

export const PREFERENCES_STORAGE_KEY = "meltin-preferences";

export const PLAYSTYLE_OPTIONS = [
  "랭크",
  "캐주얼",
  "듀오",
  "파티",
  "경쟁",
  "힐링",
  "협동",
  "스크림",
  "초보 환영",
  "티칭",
  "조용히",
  "수다",
  "밤샘",
  "한판만",
] as const;

export const MIC_OPTIONS: { value: MicPreference; label: string; hint: string }[] = [
  { value: "ok", label: "마이크 가능", hint: "말할 수 있어요" },
  { value: "required", label: "마이크 필수", hint: "보이스 있는 방만" },
  { value: "no", label: "마이크 없음", hint: "텍스트·듣기 위주" },
];

export function createEmptyPreferences(): UserPreferences {
  return {
    displayName: "",
    games: [],
    playstyles: [],
    mic: "ok",
    updatedAt: "",
  };
}

export function isPreferencesComplete(prefs: UserPreferences | null | undefined) {
  if (!prefs) return false;
  return prefs.games.length > 0 && prefs.displayName.trim().length > 0;
}
