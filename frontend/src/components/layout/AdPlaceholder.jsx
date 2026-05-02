import { useEffect, useState } from "react";
import { Megaphone, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const ADVERTISE_EMAIL = "alamotte1956@gmail.com";

const sponsorMocks = [
  {
    brand: "Aperture Eyewear",
    label: "Major eyewear brand mock",
    headline: "Feather-light acetate, premium progressives, and everyday blue-light collections designed for all-day wear.",
    cta: "Browse signature frames",
    accent: "from-sky-500/30 via-blue-500/20 to-cyan-300/20",
    perks: ["Premium fit", "Lightweight frames", "New collection"],
  },
  {
    brand: "Halo Lens",
    label: "Major contact lens brand mock",
    headline: "Comfort-first monthly lenses with hydration-focused wear, easy refill messaging, and premium brand visibility.",
    cta: "Explore lens plans",
    accent: "from-cyan-400/30 via-blue-500/20 to-indigo-300/20",
    perks: ["Monthly comfort", "Easy refill", "Dry-eye support"],
  },
  {
    brand: "Northline Vision",
    label: "Major eyewear brand mock",
    headline: "Blue-light, polarized, and progressives campaigns can rotate here with a premium brand-first presentation.",
    cta: "View style drop",
    accent: "from-indigo-500/30 via-sky-500/20 to-blue-300/20",
    perks: ["Polarized styles", "Progressive-ready", "Style launch"],
  },
  {
    brand: "ClearDay Contacts",
    label: "Major contact lens brand mock",
    headline: "Daily lens campaigns, value refill offers, and comfort-focused messaging can rotate here without overwhelming the experience.",
    cta: "See daily lens options",
    accent: "from-blue-500/30 via-cyan-400/20 to-sky-200/20",
    perks: ["Daily lenses", "Value packs", "Smooth refill"],
  },
];

export const AdPlaceholder = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % sponsorMocks.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeMock = sponsorMocks[activeIndex];

  return (
  <section className="vault-ad-placeholder" data-testid="future-ad-placeholder">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="vault-eyebrow">Reserved future ad space</p>
        <h3 className="text-lg font-semibold text-[var(--app-text)]" data-testid="future-ad-placeholder-title">
          Premium sponsor-ready placement
        </h3>
        <p className="text-sm text-[var(--app-text-soft)]" data-testid="future-ad-placeholder-description">
          Designed to support future campaigns, featured partners, or optical promotions without distracting from the private vault experience.
        </p>
      </div>

      <div className="inline-flex rounded-full border border-blue-200/70 bg-white/55 px-3 py-1 text-xs font-medium text-[var(--app-brand)]" data-testid="future-ad-placeholder-badge">
        Rotating advertiser mock {activeIndex + 1}/{sponsorMocks.length}
      </div>
    </div>

    <div className="mt-4 grid gap-4 md:grid-cols-[1fr,auto] md:items-end">
      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" data-testid="future-ad-placeholder-preview">
        <div className={`bg-gradient-to-r ${activeMock.accent} px-4 py-3`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--app-brand)]">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              {activeMock.brand}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/65 px-2.5 py-1 text-[11px] font-semibold text-[var(--app-brand)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {activeMock.label}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <p className="text-sm leading-6 text-[var(--app-text-soft)]">
            {activeMock.headline}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            {activeMock.perks.map((perk) => (
              <span className="rounded-full border border-blue-200/70 bg-white/60 px-2.5 py-1 text-[var(--app-brand)]" key={perk}>
                {perk}
              </span>
            ))}
          </div>

          <div className="space-y-2" data-testid="future-ad-placeholder-rules">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
              Campaign content rules
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-blue-200/70 bg-white/60 px-2.5 py-1 text-[var(--app-brand)]">Vision-related advertisers only</span>
              <span className="rounded-full border border-blue-200/70 bg-white/60 px-2.5 py-1 text-[var(--app-brand)]">Clearly labeled sponsored content</span>
              <span className="rounded-full border border-blue-200/70 bg-white/60 px-2.5 py-1 text-[var(--app-brand)]">One CTA max</span>
              <span className="rounded-full border border-blue-200/70 bg-white/60 px-2.5 py-1 text-[var(--app-brand)]">No unrelated ads</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:items-end">
        <a
          className="inline-flex h-8 items-center justify-center rounded-full bg-[var(--app-brand)] px-3 text-xs font-medium text-white shadow-sm transition hover:bg-[var(--app-brand-strong)]"
          data-testid="advertise-with-us-link"
          href={`mailto:${ADVERTISE_EMAIL}?subject=Advertise%20With%20Us`}
        >
          Advertise With Us
        </a>
        <Button className="h-8 px-3 text-xs" data-testid="future-ad-placeholder-cta" disabled size="sm" type="button">
          {activeMock.cta}
        </Button>
        <p className="text-xs text-[var(--app-text-soft)]" data-testid="future-ad-placeholder-note">
          Contact: {ADVERTISE_EMAIL}
        </p>
      </div>
    </div>
  </section>
  );
};

