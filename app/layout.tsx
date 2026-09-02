import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "katex/dist/katex.min.css"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LMS Admin Dashboard | SCOVER Quiz Platform",
  description: "Enterprise SaaS LMS Admin Dashboard for SCOVER",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7FAFF] text-slate-900">
        <QueryProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </QueryProvider>
      </body>
    </html>
  );
}
