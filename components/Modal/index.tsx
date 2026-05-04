// components/Modal.tsx
"use client"
import { ReactNode, useEffect } from "react";

type Props = {
    isShow: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg";
};

const sizeClass: Record<NonNullable<Props["size"]>, string> = {
    sm: "w-5/6 md:w-3/6 lg:w-2/6",
    md: "w-5/6 md:w-4/6 lg:w-3/6",
    lg: "w-5/6 md:w-5/6 lg:w-4/6",
};

const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="1" y1="1" x2="11" y2="11"/>
        <line x1="11" y1="1" x2="1" y2="11"/>
    </svg>
);

const Modal = ({ isShow, onClose, title, children, footer, size = "sm" }: Props) => {

    // Tutup modal saat tekan Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isShow) onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isShow, onClose]);

    // Prevent scroll saat modal terbuka
    useEffect(() => {
        document.body.style.overflow = isShow ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isShow]);

    if (!isShow) return null;

    return (
        <div
            className="w-full h-dvh z-1024 bg-black/30 backdrop-blur-sm fixed top-0 left-0 flex justify-center items-center"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={`${sizeClass[size]} bg-white rounded-2xl border border-black/[0.06] flex flex-col`}>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className={`px-5 text-sm text-gray-500 leading-relaxed ${title ? "pb-4" : "pt-5 pb-4"}`}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-5 pb-5 flex justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;