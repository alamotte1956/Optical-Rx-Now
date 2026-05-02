import { AppShell } from "@/components/layout/AppShell";

const localOnlyItems = [
  "Prescription photos",
  "Prescription expiration dates",
  "Person profiles",
  "PD measurements",
  "Warranty photos",
  "Contact lens reminders",
  "Expiration reminder timing",
];

const internetItems = [
  "GPS-based local optical store discovery",
  "External shopping and affiliate links",
];

const excludedItems = [
  "No manual Rx entry",
  "No OCR scanning",
  "No prescription history browser",
  "No notes or archive view",
  "No biometric lock or PIN in this enhancement",
];

export default function PrivacyPage() {
  return (
    <AppShell
      description="My Optical Wallet keeps your private vault on your device and uses the internet only for public store discovery and external shopping links."
      eyebrow="Privacy info"
      title="What stays on this device"
    >
      <div className="grid gap-6 lg:grid-cols-2" data-testid="privacy-columns-grid">
        <section className="vault-card" data-testid="privacy-local-only-card">
          <p className="vault-eyebrow">Stored locally only</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Private vault data</h2>
          <p className="mt-3 text-sm text-[var(--app-text-soft)]">These stay on your device so your family’s optical records remain private and easy to access offline.</p>
          <ul className="mt-5 space-y-3 text-sm text-[var(--app-text-soft)]">
            {localOnlyItems.map((item) => (
              <li className="rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3" data-testid={`privacy-local-item-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="vault-card" data-testid="privacy-internet-card">
          <p className="vault-eyebrow">Uses internet</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Public layer only</h2>
          <p className="mt-3 text-sm text-[var(--app-text-soft)]">These tools rely on public web services, but they stay visually and technically separate from your private vault.</p>
          <ul className="mt-5 space-y-3 text-sm text-[var(--app-text-soft)]">
            {internetItems.map((item) => (
              <li className="rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3" data-testid={`privacy-internet-item-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="vault-card" data-testid="privacy-rules-card">
          <p className="vault-eyebrow">Simplified rules</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Keep the current prescription flow clear</h2>
          <ul className="mt-5 space-y-3 text-sm text-[var(--app-text-soft)]">
            {excludedItems.map((item) => (
              <li className="rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3" data-testid={`privacy-rule-item-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="vault-card" data-testid="privacy-promise-card">
          <p className="vault-eyebrow">Current prescription concept</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Replace-only, not history-heavy</h2>
          <p className="mt-4 text-sm text-[var(--app-text-soft)]">
            When you update a prescription, the app replaces the current photo and keeps the prior one only until the new save is confirmed. The goal is simple access, not more record management.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
