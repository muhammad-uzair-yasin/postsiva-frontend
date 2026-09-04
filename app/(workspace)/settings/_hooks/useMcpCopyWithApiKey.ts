"use client";

import { useCallback, useState } from "react";

import { buildMcpUrlWithApiKey } from "@/lib/mcp/platformMcps";
import type { WorkspaceAPIKeyListItem } from "@/lib/settings/workspaceApiKeysApi";

import { copyTextToClipboard } from "../_utils/copyTextToClipboard";

type PendingCopy = {
  baseUrl: string;
  copyId: string;
};

type UseMcpCopyWithApiKeyArgs = {
  pastedApiKey: string;
  keys: WorkspaceAPIKeyListItem[];
  keysLoading: boolean;
  revealKeySecret: (keyId: string) => Promise<string>;
  onNeedApiKey?: () => void;
};

export function useMcpCopyWithApiKey({
  pastedApiKey,
  keys,
  keysLoading,
  revealKeySecret,
  onNeedApiKey,
}: UseMcpCopyWithApiKeyArgs) {
  const [copiedKey, setCopiedKey] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingCopy, setPendingCopy] = useState<PendingCopy | null>(null);
  const [copyBusy, setCopyBusy] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copyValue = useCallback(async (value: string, copyId: string): Promise<boolean> => {
    const ok = await copyTextToClipboard(value);
    if (ok) {
      setCopiedKey(copyId);
      setTimeout(() => setCopiedKey(""), 2000);
    }
    return ok;
  }, []);

  const finishCopy = useCallback(
    async (baseUrl: string, secret: string, copyId: string): Promise<boolean> => {
      const full = buildMcpUrlWithApiKey(baseUrl, secret);
      return copyValue(full, copyId);
    },
    [copyValue],
  );

  const copyUrlWithApiKey = useCallback(
    async (baseUrl: string, copyId: string): Promise<boolean> => {
      setCopyError(null);
      const pasted = pastedApiKey.trim();
      if (pasted) {
        return finishCopy(baseUrl, pasted, copyId);
      }
      if (keysLoading) {
        return false;
      }
      if (keys.length === 0) {
        onNeedApiKey?.();
        return false;
      }
      if (keys.length === 1) {
        setCopyBusy(true);
        try {
          const secret = await revealKeySecret(keys[0].id);
          return await finishCopy(baseUrl, secret, copyId);
        } catch (e) {
          setCopyError(e instanceof Error ? e.message : "Failed to load API key");
          return false;
        } finally {
          setCopyBusy(false);
        }
      }
      setPendingCopy({ baseUrl, copyId });
      setPickerOpen(true);
      return false;
    },
    [finishCopy, keys, keysLoading, onNeedApiKey, pastedApiKey, revealKeySecret],
  );

  const onPickerSelect = useCallback(
    async (keyId: string): Promise<boolean> => {
      if (!pendingCopy) {
        setPickerOpen(false);
        return false;
      }
      setCopyBusy(true);
      setCopyError(null);
      try {
        const secret = await revealKeySecret(keyId);
        return await finishCopy(pendingCopy.baseUrl, secret, pendingCopy.copyId);
      } catch (e) {
        setCopyError(e instanceof Error ? e.message : "Failed to load API key");
        return false;
      } finally {
        setCopyBusy(false);
        setPickerOpen(false);
        setPendingCopy(null);
      }
    },
    [finishCopy, pendingCopy, revealKeySecret],
  );

  const cancelPicker = useCallback(() => {
    setPickerOpen(false);
    setPendingCopy(null);
  }, []);

  const displayUrl = useCallback(
    (baseUrl: string) => {
      const pasted = pastedApiKey.trim();
      return pasted ? buildMcpUrlWithApiKey(baseUrl, pasted) : baseUrl;
    },
    [pastedApiKey],
  );

  return {
    copiedKey,
    copyBusy,
    copyError,
    pickerOpen,
    copyUrlWithApiKey,
    onPickerSelect,
    cancelPicker,
    displayUrl,
    copyPlain: copyValue,
  };
}
