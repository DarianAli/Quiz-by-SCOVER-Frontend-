// components/Alert.tsx
import { ReactNode } from "react";

type AlertVariant = "warning" | "success" | "danger" | "tips";

type Props = {
    children: ReactNode;
    title: string;
    onDismiss?: () => void;
};

const alertConfig: Record<AlertVariant, {
    bg: string;
    border: string;
    titleColor: string;
    textColor: string;
    icon: ReactNode;
}> = {
    warning: {
        bg:         "bg-amber-50",
        border:     "border-l-amber-600",
        titleColor: "text-amber-900",
        textColor:  "text-amber-800",
        icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-800">
                <path d="M8 1.5L14.5 13H1.5L8 1.5z"/>
                <line x1="8" y1="6" x2="8" y2="9"/>
                <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
        ),
    },
    success: {
        bg:         "bg-green-50",
        border:     "border-l-green-700",
        titleColor: "text-green-900",
        textColor:  "text-green-800",
        icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 shrink-0 mt-0.5 text-green-800">
                <circle cx="8" cy="8" r="6.5"/>
                <polyline points="5,8.5 7,10.5 11,6.5"/>
            </svg>
        ),
    },
    danger: {
        bg:         "bg-red-50",
        border:     "border-l-red-700",
        titleColor: "text-red-900",
        textColor:  "text-red-800",
        icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-800">
                <circle cx="8" cy="8" r="6.5"/>
                <line x1="8" y1="5" x2="8" y2="8.5"/>
                <circle cx="8" cy="11" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
        ),
    },
    tips: {
        bg:         "bg-blue-50",
        border:     "border-l-blue-700",
        titleColor: "text-blue-900",
        textColor:  "text-blue-800",
        icon: (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 shrink-0 mt-0.5 text-blue-800">
                <circle cx="8" cy="8" r="6.5"/>
                <line x1="8" y1="7.5" x2="8" y2="11"/>
                <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
        ),
    },
};

const DismissIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="2" y1="2" x2="12" y2="12"/>
        <line x1="12" y1="2" x2="2" y2="12"/>
    </svg>
);

const Alert = ({ variant, children, title, onDismiss }: Props & { variant: AlertVariant }) => {
    const { bg, border, titleColor, textColor, icon } = alertConfig[variant];

    return (
        <div className={`flex gap-3 px-4 py-3.5 rounded-xl border-l-[3px] ${bg} ${border}`}>
            {icon}
            <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium mb-0.5 ${titleColor}`}>{title}</p>
                <div className={`text-[13px] leading-relaxed ${textColor}`}>{children}</div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className={`opacity-50 hover:opacity-100 transition-opacity shrink-0 p-0.5 rounded ${textColor}`}
                >
                    <DismissIcon />
                </button>
            )}
        </div>
    );
};

export const WarningAlert = (props: Props & { onDismiss?: () => void }) =>
    <Alert variant="warning" {...props} />;

export const SuccessAlert = (props: Props & { onDismiss?: () => void }) =>
    <Alert variant="success" {...props} />;

export const DangerAlert  = (props: Props & { onDismiss?: () => void }) =>
    <Alert variant="danger"  {...props} />;

export const TipsAlert    = (props: Props & { onDismiss?: () => void }) =>
    <Alert variant="tips"    {...props} />;