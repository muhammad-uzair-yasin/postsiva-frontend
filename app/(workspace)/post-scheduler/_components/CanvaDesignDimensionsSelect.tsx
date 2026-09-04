import {
  DEFAULT_STOCK_ASPECT_RATIO_PRESET_ID,
  getStockAspectRatioPreset,
  type StockAspectRatioPresetId,
} from "@/lib/social/stockAspectRatioPresets";

export type CanvaDesignDimensions = {
  presetId: StockAspectRatioPresetId;
  width: number;
  height: number;
  cssAspectRatio: string;
};

/** Default blank-design size when opening Canva without a size picker. */
export function defaultCanvaDesignDimensions(): CanvaDesignDimensions {
  const preset = getStockAspectRatioPreset(DEFAULT_STOCK_ASPECT_RATIO_PRESET_ID);
  return {
    presetId: preset.id,
    width: preset.width,
    height: preset.height,
    cssAspectRatio: preset.cssAspectRatio,
  };
}
