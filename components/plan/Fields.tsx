"use client";
import { useEffect, useState } from "react";

interface TextProps {
  label: string;
  value: string;
  onChange(v: string): void;
  multiline?: boolean;
}

/** Text field that saves as you type. */
export function TextField({ label, value, onChange, multiline }: TextProps) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

/**
 * Field that saves when you leave it, for values that are cleaned up on save
 * (numbers, the warm-up list). Typing stays free until then.
 */
export function CommitField({ label, value, onCommit, multiline, type = "text" }: {
  label: string;
  value: string;
  onCommit(v: string): void;
  multiline?: boolean;
  type?: string;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const props = { value: v, onChange: (e: { target: { value: string } }) => setV(e.target.value), onBlur: () => onCommit(v) };
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? <textarea {...props} /> : <input type={type} {...props} />}
    </label>
  );
}

export function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: [value: string, label: string][];
  onChange(v: string): void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
