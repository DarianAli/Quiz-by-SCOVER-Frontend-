"use client"

import { useState, InputHTMLAttributes } from "react"

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    value: string
}

export default function FloatingInput({ label, value, className = "", ...props }: FloatingInputProps) {
    const [focused, setFocused] = useState(false)

    const isFloating = focused || value.length > 0

    return (
        <div className="relative w-full pt-4 pb-1">
            {/* Floating Label */}
            <label
                className={`
                    absolute left-0 font-medium pointer-events-none select-none
                    transition-all duration-200 ease-in-out
                    ${isFloating
                        ? "top-0 text-xs text-[#8b8b8b]"
                        : "top-5 text-base text-[#8b8b8b]"
                    }
                `}
            >
                {label}
            </label>

            {/* Input */}
            <input
                {...props}
                value={value}
                onFocus={(e) => {
                    setFocused(true)
                    props.onFocus?.(e)
                }}
                onBlur={(e) => {
                    setFocused(false)
                    props.onBlur?.(e)
                }}
                className={`
                    w-full bg-transparent outline-none border-0 border-b-2 pt-1 pb-2 text-[#111111] text-base
                    transition-all duration-200 ease-in-out
                    ${focused ? "border-[#111111]" : "border-[#d1d1d1]"}
                    ${className}
                `}
                placeholder=""
            />
        </div>
    )
}
