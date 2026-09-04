"use client";

import { useCallback, useRef } from "react";

const OTP_LENGTH = 6;

type OtpDigitBoxesProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function OtpDigitBoxes({
  value,
  onChange,
  disabled = false,
}: OtpDigitBoxesProps): React.ReactElement {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? "");

  const focusAt = useCallback((index: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))];
    el?.focus();
    el?.select();
  }, []);

  const applyDigits = useCallback(
    (next: string) => {
      const cleaned = next.replace(/\D/g, "").slice(0, OTP_LENGTH);
      onChange(cleaned);
      if (cleaned.length < OTP_LENGTH) {
        focusAt(cleaned.length);
      }
    },
    [focusAt, onChange],
  );

  return (
    <div
      className="flex justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="6-digit verification code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          className="h-14 w-11 rounded-xl border border-outline-variant/25 bg-surface-container-low text-center text-xl font-bold text-on-surface transition-all focus:border-secondary/60 focus:bg-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-60 sm:h-16 sm:w-12"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, "").slice(-1);
            const next =
              value.slice(0, index) + char + value.slice(index + 1);
            applyDigits(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit) {
              e.preventDefault();
              const next = value.slice(0, index);
              onChange(next);
              focusAt(index - 1);
              return;
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              focusAt(index - 1);
              return;
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              focusAt(index + 1);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text");
            applyDigits(pasted);
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
