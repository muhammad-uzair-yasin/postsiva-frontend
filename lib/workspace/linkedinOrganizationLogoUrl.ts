function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function logoUrlFromImageData(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }
  const expanded =
    (isRecord(value["original~"]) && value["original~"]) ||
    (isRecord(value["displayImage~"]) && value["displayImage~"]) ||
    value;
  const elements = Array.isArray(expanded.elements)
    ? expanded.elements.filter(isRecord)
    : [];
  for (const element of elements.toReversed()) {
    const identifiers = Array.isArray(element.identifiers)
      ? element.identifiers.filter(isRecord)
      : [];
    for (const identifier of identifiers) {
      const url = nonEmptyString(identifier.identifier);
      if (url?.startsWith("http")) {
        return url;
      }
    }
  }
  return null;
}

/** Resolve a LinkedIn organization logo from persisted decorated logoV2 data. */
export function linkedinOrganizationLogoUrl(
  organization: Record<string, unknown>,
): string | null {
  const direct =
    nonEmptyString(organization.logo_url) ??
    nonEmptyString(organization.profile_picture_url) ??
    nonEmptyString(organization.picture);
  if (direct) {
    return direct;
  }
  const fromLogoData = logoUrlFromImageData(organization.logo_data);
  if (fromLogoData) {
    return fromLogoData;
  }
  const raw = isRecord(organization.raw_api_data)
    ? organization.raw_api_data
    : null;
  return raw ? logoUrlFromImageData(raw.logoV2) : null;
}
