import Link from "next/link";
import { Compass } from "lucide-react";

type Props = {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
};

const HeroBanner = ({
    title = "My Learning Journey",
    subtitle = "Track your progress and achieve your goals.",
    buttonText = "Explore Courses",
    buttonLink = "#"
}: Props) => {
    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Background Gradient */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#112B66] via-[#174EA6] to-[#1D61D2] p-6 sm:p-8 md:p-10 animate-fade-slide-up" />
            
            {/* Background Abstract Blob (Optional Extra Polish) */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-6 md:px-10 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white space-y-3 text-center md:text-left z-10">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {title}
                    </h2>
                    <p className="text-blue-100 text-sm md:text-base font-medium max-w-lg">
                        {subtitle}
                    </p>
                </div>
                
                <div className="z-10 shrink-0 mt-4 md:mt-0">
                    <Link
                        href={buttonLink}
                        className="flex items-center gap-2 px-6 py-3 bg-[#F9C73D] text-[#083E63] font-bold rounded-full shadow-lg hover:bg-[#ffe182] hover:-translate-y-1 transition-all duration-300 active:scale-95 outline-none focus:ring-2 focus:ring-[#F9C73D] focus:ring-offset-2 focus:ring-offset-[#0B5C8C]"
                    >
                        {buttonText}
                        <Compass className="w-5 h-5 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;