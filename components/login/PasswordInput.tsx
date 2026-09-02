"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
    label: string
    value: string
    onChange: (value: string) => void
}

export default function PasswordInput({ label, value, onChange }: PasswordInputProps) {
    const [focused, setFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

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
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder=""
                className={`
                    w-full bg-transparent outline-none border-0 border-b-2 pt-1 pb-2 pr-10
                    text-[#111111] text-base
                    transition-all duration-200 ease-in-out
                    ${focused ? "border-[#111111]" : "border-[#d1d1d1]"}
                `}
            />

            {/* Eye Toggle */}
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 bottom-3 text-[#8b8b8b] hover:text-[#111111] transition-colors duration-200 cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword
                    ? <EyeOff size={18} strokeWidth={1.8} />
                    : <Eye size={18} strokeWidth={1.8} />
                }
            </button>
        </div>
    )
}
