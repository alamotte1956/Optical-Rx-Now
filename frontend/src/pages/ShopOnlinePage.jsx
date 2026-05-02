import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag, WifiOff } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { loadAdminState } from "@/lib/admin-storage";

export default function ShopOnlinePage() {
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [affiliates, setAffiliates] = useState(() => loadAdminState().affiliates.filter((affiliate) => affiliate.active));

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    setAffiliates(loadAdminState().affiliates.filter((affiliate) => affiliate.active));
  }, []);

  return (
    <AppShell
      description="Browse optical partners online without sending any prescription photo or private vault details from your local-only records."
      eyebrow="Public shopping"
      title="Shop optical partners online"
    >
      {isOffline ? (
        <div className="vault-card mb-4 border-blue-200/70 bg-white/55" data-testid="shop-offline-state">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/80 text-[var(--app-brand)]">
              <WifiOff className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--app-text)]">Shopping links need internet access</p>
              <p className="mt-1 text-sm text-[var(--app-text-soft)]">
                You can still browse your local vault offline, but partner shopping links and campaign destinations work best once you reconnect.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2" data-testid="shop-links-grid">
        {affiliates.map((link) => (
          <article className="vault-card" data-testid={`shop-link-card-${link.id}`} key={link.id}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-brand)]">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="vault-eyebrow mt-5">External partner link</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]" data-testid={`shop-link-name-${link.id}`}>
              {link.name}
            </h2>
            <p className="mt-3 text-sm text-[var(--app-text-soft)]" data-testid={`shop-link-description-${link.id}`}>
              {link.description}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--app-text-soft)]" data-testid={`shop-link-network-${link.id}`}>
              {link.network}
            </p>

            <a className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--app-brand)] px-5 py-3 text-sm font-medium text-white" data-testid={`shop-link-open-${link.id}`} href={link.programUrl} rel="noreferrer" target="_blank">
              Open site <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-6 vault-card" data-testid="shop-privacy-note">
        Private vault details stay local. Shopping links open separately and never auto-fill prescription data from your vault.
      </div>
    </AppShell>
  );
}
