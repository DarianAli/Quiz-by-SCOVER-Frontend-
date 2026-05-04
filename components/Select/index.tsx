// components/Select.tsx
"use client"
import { ReactNode, useEffect, useRef, useState } from "react";

type Option = {
    label: string;
    value: number;
};

// ─── Shared styles ───────────────────────────────────────
const baseControl = [
    "w-full text-sm rounded-lg border border-black/10 bg-white",
    "px-3 py-2.5 text-black/80 placeholder:text-black/25",
    "transition-all duration-150 outline-none",
    "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15",
].join(" ");

// ─── Sub-components ──────────────────────────────────────
const FieldLabel = ({ htmlFor, required, children }: {
    htmlFor: string; required?: boolean; children: ReactNode;
}) => (
    <label htmlFor={htmlFor} className="text-xs font-medium text-gray-500 flex items-center gap-1">
        {children}
        {required && <span className="text-red-500 text-[10px]">*</span>}
    </label>
);

const ChevronIcon = ({ open }: { open?: boolean }) => (
    <svg
        width="14" height="14" viewBox="0 0 14 14"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-200 shrink-0 text-gray-400 ${open ? "rotate-180" : ""}`}
    >
        <polyline points="3,5 7,9 11,5"/>
    </svg>
);

const CheckIcon = () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1.5,5 4,7.5 8.5,2"/>
    </svg>
);

const XIcon = () => (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="1" y1="1" x2="8" y2="8"/>
        <line x1="8" y1="1" x2="1" y2="8"/>
    </svg>
);

// ─── Select ──────────────────────────────────────────────
type SelectProps = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    label?: string;
    required?: boolean;
    className?: string;
    hint?: string;
};

export const Select = ({ id, value, onChange, children, label, required, className = "", hint }: SelectProps) => (
    <div className="flex flex-col gap-1 my-1">
        {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}
        <div className="relative">
            <select
                id={id}
                value={value}
                required={required}
                onChange={e => onChange(e.target.value)}
                className={`appearance-none cursor-pointer ${baseControl} pr-9 ${className}`}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronIcon />
            </div>
        </div>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
);

// ─── MultiSelect ─────────────────────────────────────────
type MultiSelectProps = {
    id: string;
    value: number[];
    onChange: (value: number[]) => void;
    options: Option[];
    label?: string;
    required?: boolean;
    className?: string;
    placeholder?: string;
    hint?: string;
};

export const MultiSelect = ({
    id, value, onChange, options,
    label, required, className = "",
    placeholder = "Pilih opsi...", hint,
}: MultiSelectProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggle = (val: number) => {
        onChange(value.includes(val) ? value.filter(v => v !== val) : [...value, val]);
    };

    const remove = (e: React.MouseEvent, val: number) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== val));
    };

    const selectedOptions = options.filter(o => value.includes(o.value));

    return (
        <div className="flex flex-col gap-1 my-1" ref={ref}>
            {label && <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>}

            {/* Trigger */}
            <div
                id={id}
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 cursor-pointer min-h-[42px] ${baseControl} ${open ? "border-indigo-400 ring-2 ring-indigo-400/15" : ""} ${className}`}
            >
                <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(opt => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-1"
                            >
                                {opt.label}
                                <button
                                    onClick={e => remove(e, opt.value)}
                                    className="text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
                                >
                                    <XIcon />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-black/25">{placeholder}</span>
                    )}
                </div>
                <ChevronIcon open={open} />
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-black/10 rounded-xl overflow-hidden max-h-56 overflow-y-auto shadow-sm">
                    {options.map(opt => {
                        const selected = value.includes(opt.value);
                        return (
                            <div
                                key={opt.value}
                                onClick={() => toggle(opt.value)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${selected ? "text-indigo-600" : "text-gray-700"} hover:bg-gray-50`}
                            >
                                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-indigo-500 border-indigo-500" : "border-gray-300 bg-white"}`}>
                                    {selected && <CheckIcon />}
                                </div>
                                {opt.label}
                            </div>
                        );
                    })}
                </div>
            )}

            {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
        </div>
    );
};