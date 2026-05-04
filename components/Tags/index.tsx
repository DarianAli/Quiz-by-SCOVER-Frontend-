// components/Tags.tsx
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
};

type DifficultyLevel = "easy" | "medium" | "hard";

const difficultyConfig: Record<DifficultyLevel, { bg: string; text: string }> = {
    easy:   { bg: "bg-green-100",  text: "text-green-800"  },
    medium: { bg: "bg-amber-100",  text: "text-amber-800"  },
    hard:   { bg: "bg-red-100",    text: "text-red-800"    },
};

// ─── Base ────────────────────────────────────────────────
const Tag = ({
    children,
    className = "",
    icon,
}: Props & { icon?: ReactNode }) => (
    <div className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 ${className}`}>
        {icon}
        {children}
    </div>
);

// ─── Icons ───────────────────────────────────────────────
const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1.5,6 4.5,9.5 10.5,3"/>
    </svg>
);

const WarningIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 1L11.5 11H0.5L6 1z"/>
        <line x1="6" y1="4.5" x2="6" y2="7"/>
        <circle cx="6" cy="9" r="0.6" fill="currentColor" stroke="none"/>
    </svg>
);

const CrossIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="1.5" y1="1.5" x2="10.5" y2="10.5"/>
        <line x1="10.5" y1="1.5" x2="1.5" y2="10.5"/>
    </svg>
);

// ─── Components ──────────────────────────────────────────
export const QuizDifficulty = ({
    children,
    className = "",
    level = "medium",
}: Props & { level?: DifficultyLevel }) => {
    const { bg, text } = difficultyConfig[level];
    return (
        <Tag className={`${bg} ${text} ${className}`}>
            {children}
        </Tag>
    );
};

export const ClassTag = ({ children, className = "" }: Props) => (
    <Tag className={`bg-gray-900 text-white ${className}`}>
        {children}
    </Tag>
);

export const DoneTag = ({ children, className = "" }: Props) => (
    <Tag
        icon={<CheckIcon />}
        className={`bg-green-100 text-green-700 ${className}`}
    >
        {children}
    </Tag>
);

export const DueTag = ({ children, className = "" }: Props) => (
    <Tag
        icon={<WarningIcon />}
        className={`bg-amber-100 text-amber-700 ${className}`}
    >
        {children}
    </Tag>
);

export const OverdueTag = ({ children, className = "" }: Props) => (
    <Tag
        icon={<CrossIcon />}
        className={`bg-red-100 text-red-700 ${className}`}
    >
        {children}
    </Tag>
);