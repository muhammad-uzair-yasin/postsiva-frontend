"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function DeleteWorkspaceBlurredMain(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <main className="min-h-screen px-6 pb-12 pt-28 blur-md select-none pointer-events-none opacity-40 md:px-10 xl:px-12 2xl:px-16">
      <div className="w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            {t("workspaces.deleteBlurredTitle")}
          </h1>
          <p className="text-on-surface-variant">
            {t("workspaces.deleteBlurredSubtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-surface-container rounded-xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <span className="bg-secondary-container/20 text-secondary px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                {t("workspaces.deleteBlurredActive")}
              </span>
            </div>
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 bg-primary-container/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    rocket_launch
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{t("workspaces.deleteBlurredMockTitle")}</h3>
                <p className="text-on-surface-variant max-w-md">
                  {t("workspaces.deleteBlurredMockBody")}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-surface-container"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDhBR4DNZHb9ljLeAN_5dZ4Oo0CRZgsWjdzF5wuIo6NG3GR3d2UjDEBMNQxRV4YY3V_4lz-cjoN2M3BseoT5v00GX9PB_hU4587vw3UuwyWHmOnvcM-VOKI0AJ62-InbjsVz1CCBLIIEdrMkXg48FbUWSUk-MnSqHgBP2qEPdq-p4hC5bhHuF8xMwGPl7olwnZrCVmaleJhsw7e3j2zKMbnKCRS1ihaiadRK58ug4gvJDs2UlzxCoI6IIhQvPEujOfkKemCbIYL5c3"
                  />
                  <img
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-surface-container"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_o0gcWjolEJu9BIAifdvwOdzgxAz8dn8EehVZ9PZatjNDlM-3oickf84F5mo4k-DjE-POokt9rpNjz7B1jpTcAlYGq1KjncWSOKMk-vfm7NLRuTOsJCrgeAh05GAglAHlcXF_f9YSntXk26KCgcP0zxn5uN_qyimRjI82DcgE4axRhIlFbrj1-mnbW-pPmWszQXv-Tjs7VTFzaLf3DprhAYRMsoNeHi0mFiGDUE30LK3xVb3yw8ISzddVFf_AXlkVXUddwp5ASasC"
                  />
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                    +12
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant">
                  {t("workspaces.deleteBlurredLastActivity")}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-8 border border-primary-container/30 relative">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-secondary">
                    architecture
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{t("workspaces.deleteBlurredLegacyTitle")}</h3>
                <p className="text-sm text-on-surface-variant">
                  {t("workspaces.deleteBlurredLegacyBody")}
                </p>
              </div>
              <button
                type="button"
                className="w-full py-3 rounded-lg bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-colors"
              >
                {t("workspaces.deleteBlurredEnterWorkspace")}
              </button>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-xl p-8 flex items-center justify-center border-2 border-dashed border-outline-variant/30 group cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">add</span>
              </div>
              <p className="font-bold text-on-surface-variant">{t("workspaces.deleteBlurredCreateNew")}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
