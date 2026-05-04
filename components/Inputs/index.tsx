// components/Input.tsx
"use client"
import { KeyboardEvent, ReactNode, TextareaHTMLAttributes } from "react";

type InputProps = {
    id: string;
    type: "text" | "number" | "color" | "email" | "password" | "date";
    onChange: (value: string) => void;
    value?: string;
    min?: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    readOnly?: boolean;
    label?: string;
    hint?: string;
    error?: string;
    onKeyUp?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

type TextAreaProps = {
    id: string;
    onChange: (value: string) => void;
    value?: string;
    className?: string;
    required?: boolean;
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    rows?: number;
};

// ─── Shared styles ───────────────────────────────────────
const baseInput = [
    "w-full text-sm rounded-lg px-3 py-2.5 bg-white",
    "border border-black/10 text-black/80 placeholder:text-black/25",
    "transition-all duration-150 outline-none",
    "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15",
    "read-only:bg-gray-50 read-only:cursor-default",
    "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const errorInput = "border-red-400 focus:border-red-400 focus:ring-red-400/15";

// ─── Sub-components ──────────────────────────────────────
const Label = ({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) => (
    <label htmlFor={htmlFor} className="text-xs font-medium text-gray-500 flex items-center gap-1">
        {children}
        {required && <span className="text-red-500 text-[10px]">*</span>}
    </label>
);

const Hint = ({ error, hint }: { error?: string; hint?: string }) => {
    if (!error && !hint) return null;
    return (
        <p className={`text-[11px] mt-0.5 ${error ? "text-red-500" : "text-gray-400"}`}>
            {error ?? hint}
        </p>
    );
};

// ─── Components ──────────────────────────────────────────

/** Input standalone tanpa label — untuk pakai inline atau custom layout */
export const InputComponent = ({
    value, onChange, type, className = "", id,
    required, placeholder, onKeyUp, readOnly,
}: InputProps) => (
    <input
        id={id}
        type={type}
        value={value ?? ""}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={e => onChange(e.target.value)}
        onKeyUp={onKeyUp}
        className={`${baseInput} ${className}`}
    />
);

/** Input dengan label, hint, dan error state */
export const InputGroupComponent = ({
    value, onChange, type, className = "", id,
    required, placeholder, onKeyUp, readOnly,
    min, label, hint, error,
}: InputProps) => (
    <div className="w-full flex flex-col gap-1 my-1">
        {label && <Label htmlFor={id} required={required}>{label}</Label>}
        <input
            id={id}
            type={type}
            value={value ?? ""}
            min={min}
            required={required}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={e => onChange(e.target.value)}
            onKeyUp={onKeyUp}
            className={`${baseInput} ${error ? errorInput : ""} ${className}`}
        />
        <Hint hint={hint} error={error} />
    </div>
);

/** Textarea dengan label, hint, dan error state */
export const TextGroupComponent = ({
    value, onChange, className = "", id,
    required, placeholder, label, hint, error, rows = 3,
}: TextAreaProps) => (
    <div className="w-full flex flex-col gap-1 my-1">
        {label && <Label htmlFor={id} required={required}>{label}</Label>}
        <textarea
            id={id}
            value={value ?? ""}
            rows={rows}
            required={required}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            className={`${baseInput} resize-y leading-relaxed ${error ? errorInput : ""} ${className}`}
        />
        <Hint hint={hint} error={error} />
    </div>
);