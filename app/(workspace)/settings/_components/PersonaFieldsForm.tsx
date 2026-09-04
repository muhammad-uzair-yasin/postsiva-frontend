"use client";

import type { ReactElement } from "react";

import type { PersonaFields } from "@/lib/social/brandPersonaTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PersonaFieldsFormProps {
  values: PersonaFields;
  onChange: (key: keyof PersonaFields, value: string) => void;
  disabled?: boolean;
}

export function PersonaFieldsForm({
  values,
  onChange,
  disabled,
}: PersonaFieldsFormProps): ReactElement {
  const { t } = useTranslations();

  const fields: { key: keyof PersonaFields; labelKey: string; placeholderKey: string }[] = [
    { key: "tone", labelKey: "settings.personaFieldTone", placeholderKey: "settings.personaFieldTonePlaceholder" },
    {
      key: "brand_description",
      labelKey: "settings.personaFieldBrand",
      placeholderKey: "settings.personaFieldBrandPlaceholder",
    },
    {
      key: "target_audience",
      labelKey: "settings.personaFieldAudience",
      placeholderKey: "settings.personaFieldAudiencePlaceholder",
    },
    { key: "avoid", labelKey: "settings.personaFieldAvoid", placeholderKey: "settings.personaFieldAvoidPlaceholder" },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ key, labelKey, placeholderKey }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {t(labelKey)}
          </label>
          <textarea
            value={values[key]}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled}
            rows={key === "brand_description" ? 3 : 2}
            placeholder={t(placeholderKey)}
            className="w-full resize-y rounded-xl border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 disabled:opacity-60"
          />
        </div>
      ))}
    </div>
  );
}
