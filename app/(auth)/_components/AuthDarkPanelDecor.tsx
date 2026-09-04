export function AuthDarkPanelDecor(): React.ReactElement {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,88,188,0.38),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 top-1/3 h-[360px] w-[360px] rounded-full bg-[#0058bc]/20 blur-3xl"
      />
    </>
  );
}
