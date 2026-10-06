"use client";

import { useMemo, useState } from "react";

type TagPickerProps = {
  values: string[];
  suggestions: readonly string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  accent?: "signal" | "ink";
  maxLength?: number;
};

function normalize(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export function TagPicker({
  values,
  suggestions,
  onChange,
  placeholder = "검색하거나 직접 입력…",
  accent = "signal",
  maxLength = 40,
}: TagPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = suggestions.filter((s) => !values.includes(s));
    if (!q) return pool.slice(0, 12);
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
  }, [query, suggestions, values]);

  const exactExists =
    query.trim().length > 0 &&
    [...suggestions, ...values].some(
      (s) => s.toLowerCase() === query.trim().toLowerCase(),
    );

  function add(raw: string) {
    const tag = normalize(raw).slice(0, maxLength);
    if (!tag) return;
    const dup = values.some((v) => v.toLowerCase() === tag.toLowerCase());
    if (dup) {
      setQuery("");
      return;
    }
    onChange([...values, tag]);
    setQuery("");
  }

  function remove(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  const activeClass =
    accent === "signal"
      ? "border-[var(--signal)] bg-[var(--signal)] text-white"
      : "border-[var(--ink)] bg-[var(--ink)] text-white";

  return (
    <div>
      {values.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {values.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => remove(tag)}
              className={`group border px-3 py-1.5 text-sm font-semibold transition ${activeClass}`}
              title="클릭해서 제거"
            >
              {tag}
              <span className="ml-2 opacity-70 group-hover:opacity-100">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(query);
            }
          }}
          placeholder={placeholder}
          maxLength={maxLength}
          className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3 text-sm outline-none focus:border-[var(--ink)]"
        />
        <button
          type="button"
          onClick={() => add(query)}
          disabled={!query.trim()}
          className="shrink-0 border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3 text-sm font-bold transition hover:border-[var(--ink)] disabled:opacity-40"
        >
          추가
        </button>
      </div>

      {(filtered.length > 0 || (query.trim() && !exactExists)) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filtered.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => add(item)}
              className="border border-[var(--line)] bg-[var(--paper-2)] px-3 py-1.5 text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--ink)]"
            >
              {item}
            </button>
          ))}
          {query.trim() && !exactExists && (
            <button
              type="button"
              onClick={() => add(query)}
              className="border border-dashed border-[var(--signal)] bg-[var(--signal-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--signal-deep)] transition hover:border-[var(--signal-deep)]"
            >
              “{normalize(query)}” 직접 추가
            </button>
          )}
        </div>
      )}
    </div>
  );
}
