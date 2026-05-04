// components/Buttons.tsx
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
};

// ─── Icons ───────────────────────────────────────────────
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1.5,6 4.5,9.5 10.5,3"/>
    </svg>
);

const WarningIcon = () => (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 1L11.5 11H0.5L6 1z"/>
        <line x1="6" y1="4.5" x2="6" y2="7"/>
        <circle cx="6" cy="9" r="0.6" fill="currentColor" stroke="none"/>
    </svg>
);

const ChevronIcon = () => (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4,2 9,6 4,10"/>
    </svg>
);

// ─── Base ────────────────────────────────────────────────
const Button = ({
    children,
    type = "button",
    onClick,
    className = "",
    disabled = false,
}: Props) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-4 py-2 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
        {children}
    </button>
);

// ─── Variants ────────────────────────────────────────────
export const MainButton = (props: Props) => (
    <Button {...props} className={`bg-gray-900 text-white hover:bg-gray-700 ${props.className ?? ""}`} />
);

export const SecondButton = (props: Props) => (
    <Button {...props} className={`bg-gray-100 text-gray-800 hover:bg-gray-200 ${props.className ?? ""}`} />
);

export const SubmitButton = ({ children, ...props }: Props) => (
    <Button {...props} className={`bg-green-100 text-green-700 hover:bg-green-200 ${props.className ?? ""}`}>
        <CheckIcon />
        {children}
    </Button>
);

export const UnsureButton = ({ children, ...props }: Props) => (
    <Button {...props} className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ${props.className ?? ""}`}>
        <WarningIcon />
        {children}
    </Button>
);

export const NextButton = ({ children, ...props }: Props) => (
    <Button {...props} className={`bg-gray-100 text-gray-700 hover:bg-gray-200 ${props.className ?? ""}`}>
        {children}
        <ChevronIcon />
    </Button>
);