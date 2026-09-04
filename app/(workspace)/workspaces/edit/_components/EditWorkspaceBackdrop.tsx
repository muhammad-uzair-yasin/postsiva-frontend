export function EditWorkspaceBackdrop(): React.ReactElement {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40 blur-sm">
      <header className="flex justify-between items-center px-8 h-16 w-full bg-[#11131E]/70 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <img
            alt=""
            className="h-8 w-8 rounded-lg"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQZ1lpL3YlWFmOzN_m1ptRI9x15dOHqMsXIoBsLFMwdd5AZ3d3_2DOu8bhYEtFPwhu7MtlJbGCUNyuJ73lGUbyqQKI0J-6NXTd2M96vsMmcxpUhrHyW-XX17fltRfVMPVdkw8qR_KNfdXaE43F_AYZORNiE0Sturuik_Im7EJAqUcDg-Jf4B9esSu6wvPUjnmLtY4uH3bCHDSfFC3VrhIYnFxsgWfThJfgotb_JZANilSPBh46XYWQI8d8Jihs6CwUwc7U6ZZl2by8"
          />
          <span className="text-xl font-bold tracking-tighter text-[#E1E1F1]">
            Postsiva
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
        </div>
      </header>
      <main className="w-full px-6 py-24 md:px-10 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 rounded-xl bg-surface-container" />
          <div className="h-64 rounded-xl bg-surface-container" />
          <div className="h-64 rounded-xl bg-surface-container" />
        </div>
      </main>
    </div>
  );
}
