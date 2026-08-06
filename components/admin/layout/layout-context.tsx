"use client";

import React, { createContext, useContext, useState } from "react";

interface LayoutContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobile: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);

  return (
    <LayoutContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobile,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useDashboardLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useDashboardLayout must be used within a LayoutProvider");
  }
  return context;
}
