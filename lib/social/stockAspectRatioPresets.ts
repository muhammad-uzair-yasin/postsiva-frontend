import type { StockOrientation } from "@/lib/social/stockMediaApi";

/** Preset ids encode pixel dimensions shown in the filter UI. */
export type StockAspectRatioPresetId =
  | "1024x1024"
  | "1920x1080"
  | "1080x1920"
  | "1080x1350"
  | "1200x630";

export interface StockAspectRatioPreset {
  id: StockAspectRatioPresetId;
  width: number;
  height: number;
  /** Value for CSS `aspect-ratio` on uniform grid tiles. */
  cssAspectRatio: string;
  /** Stock APIs only support coarse orientation; closest match per preset. */
  orientation: StockOrientation;
}

export const STOCK_ASPECT_RATIO_PRESETS: StockAspectRatioPreset[] = [
  {
    id: "1024x1024",
    width: 1024,
    height: 1024,
    cssAspectRatio: "1 / 1",
    orientation: "square",
  },
  {
    id: "1920x1080",
    width: 1920,
    height: 1080,
    cssAspectRatio: "16 / 9",
    orientation: "landscape",
  },
  {
    id: "1080x1920",
    width: 1080,
    height: 1920,
    cssAspectRatio: "9 / 16",
    orientation: "portrait",
  },
  {
    id: "1080x1350",
    width: 1080,
    height: 1350,
    cssAspectRatio: "4 / 5",
    orientation: "portrait",
  },
  {
    id: "1200x630",
    width: 1200,
    height: 630,
    cssAspectRatio: "1200 / 630",
    orientation: "landscape",
  },
];

export const DEFAULT_STOCK_ASPECT_RATIO_PRESET_ID: StockAspectRatioPresetId = "1920x1080";

export function getStockAspectRatioPreset(
  id: StockAspectRatioPresetId,
): StockAspectRatioPreset {
  return (
    STOCK_ASPECT_RATIO_PRESETS.find((preset) => preset.id === id) ??
    STOCK_ASPECT_RATIO_PRESETS.find((preset) => preset.id === DEFAULT_STOCK_ASPECT_RATIO_PRESET_ID)!
  );
}

export function formatStockAspectRatioLabel(preset: StockAspectRatioPreset): string {
  return `${preset.width} × ${preset.height}`;
}
