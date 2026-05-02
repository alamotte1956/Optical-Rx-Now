import { NavLink } from "react-router-dom";
import { BellDot, Compass, LockKeyhole, ShoppingBag, WalletCards } from "lucide-react";

import { AdPlaceholder } from "@/components/layout/AdPlaceholder";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NetworkStatusBanner } from "@/components/layout/NetworkStatusBanner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Vault", icon: WalletCards, testId: "vault-nav-link" },
  { href: "/reminders", label: "Reminders", icon: BellDot, testId: "reminders-nav-link" },
  { href: "/stores", label: "Stores", icon: Compass, testId: "stores-nav-link" },
  { href: "/shop", label: "Shop", icon: ShoppingBag, testId: "shop-nav-link" },
  { href: "/privacy", label: "Privacy", icon: LockKeyhole, testId: "privacy-nav-link" },
];

export const AppShell = ({ eyebrow, title, description, children, actions, onBrandLongPress, showBrandLogo = false, showAdPlaceholder = true }) => (
  <div className="vault-shell bg-[var(--app-background)] text-[var(--app-text)]">
    <div className="vault-shell-inner mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-5 lg:px-6">
      <NetworkStatusBanner />
      <header className="vault-hero-panel" data-testid="app-shell-header">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            {showBrandLogo ? <BrandLogo onLongPress={onBrandLongPress} /> : null}
            <p className="vault-eyebrow" data-testid="app-shell-eyebrow">
              {eyebrow}
            </p>
            <div className="space-y-2">
              <h1 className="vault-page-title" data-testid="app-shell-title">
                {title}
              </h1>
              <p className="max-w-2xl text-sm text-[var(--app-text-soft)] sm:text-base" data-testid="app-shell-description">
                {description}
              </p>
            </div>
          </div>

          {actions ? <div className="vault-header-actions">{actions}</div> : null}
        </div>
      </header>

      <main className="vault-shell-main flex-1" data-testid="app-shell-main-content">
        {children}
        {showAdPlaceholder ? <AdPlaceholder /> : null}
      </main>
    </div>

    <nav className="vault-bottom-nav" data-testid="app-bottom-navigation">
      {navItems.map(({ href, label, icon: Icon, testId }) => (
        <NavLink
          key={href}
          className={({ isActive }) =>
            cn(
              "vault-bottom-nav-link",
              isActive ? "vault-bottom-nav-link-active" : "vault-bottom-nav-link-inactive",
            )
          }
          data-testid={testId}
          to={href}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
);
