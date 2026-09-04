"use client";

import { useWorkspaceLayout } from "../_context/WorkspaceLayoutContext";

interface WorkspacePageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function WorkspacePageContainer({ children, className = "" }: WorkspacePageContainerProps) {
  const { layoutMode } = useWorkspaceLayout();
  
  // Sidebar mode: no top padding needed (mobile top bar handled by WorkspaceLayoutShell)
  // Navbar mode: pt-24 for fixed navbar
  const topPadding = layoutMode === "sidebar" ? "pt-0" : "pt-24";
  
  return (
    <div className={`${topPadding} ${className}`}>
      {children}
    </div>
  );
}
