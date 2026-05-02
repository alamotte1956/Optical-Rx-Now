import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const AGE_KEY = "age-verified";

export const AgeVerificationGate = () => {
  const [isReady, setIsReady] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(AGE_KEY) === "true";
    setIsVerified(stored);
    setIsReady(true);
  }, []);

  if (!isReady || isVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08111f]/78 px-4 backdrop-blur-xl" data-testid="age-verification-overlay">
      <div className="w-full max-w-lg rounded-[1.6rem] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(232,242,255,0.68))] p-6 shadow-[0_24px_60px_rgba(8,17,31,0.35)]">
        <p className="vault-eyebrow" data-testid="age-verification-eyebrow">Age verification</p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--app-text)]" data-testid="age-verification-title">Please confirm you are 18 or older</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--app-text-soft)]" data-testid="age-verification-description">
          This screen appears only once on this device. The admin can reset it later from the admin panel if needed.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            className="w-full"
            data-testid="age-verification-confirm-button"
            onClick={() => {
              window.localStorage.setItem(AGE_KEY, "true");
              setIsVerified(true);
            }}
            type="button"
          >
            I am 18+
          </Button>
          <Button
            className="w-full"
            data-testid="age-verification-exit-button"
            onClick={() => window.location.assign("https://www.google.com")}
            type="button"
            variant="outline"
          >
            Exit app
          </Button>
        </div>
      </div>
    </div>
  );
};
