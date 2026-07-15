import { transform } from "next/dist/build/swc";
import { Config } from "tailwindcss";

const themeExtension: Config["theme"] = {
    extend: {
        colors: {
            royal: {
                50: "#EAF3FF",   // Light Blue
                400: "#3B7DDE",
                500: "#1D61D2",  // Royal Blue (primary)
                600: "#174EA6",  // Dark Blue
                700: "#112B66",  // Deep Navy 
            },
            gold: {
                50: "#FFF8E1",
                300: "#FFD95A",  // Soft Gold
                400: "#F4C430",  // Gold (secondary)
                500: "#E9B21F",  // Warm Gold
            },
        },
        keyframes: {
            "fade-slide-up": {
                "0%": { opacity: "0", transform: "translateY(8px)" },
                "100%": { opacity: "1", transform: "translateY(0)" },
            },
            "pulse-soft": {
                "0%, 100%": { opacity: "1" },
                "50%": { opacity: "0.55" },
            },
            "gradient-fade": {
                "0%": { opacity: "0" },
                "100%": { opacity: "1" },
            },
        },
        animation: {
            "fade-slide-up": "fade-slide-up 320ms ease-out both",
            "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
            "gradient-fade": "gradient-fade 250ms ease-out both", 
        },
    },
}

export default themeExtension;