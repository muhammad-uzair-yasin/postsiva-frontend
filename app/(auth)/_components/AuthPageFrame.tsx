interface AuthPageFrameProps {
  readonly children: React.ReactNode;
}

export function AuthPageFrame({ children }: AuthPageFrameProps): React.ReactElement {
  return (
    <div className="app-viewport relative flex min-h-screen min-w-0 max-w-full flex-col overflow-x-clip bg-[#F9FAFB] font-body text-[#181c23] selection:bg-[#d8e2ff] selection:text-[#001a41]">
      {children}
    </div>
  );
}
