import { AppShell } from "@/components/layout/AppShell";

const termsSections = [
  {
    title: "Personal responsibility",
    detail: "My Optical Wallet helps you store and organize optical information, but it does not replace licensed medical advice, diagnosis, or treatment.",
  },
  {
    title: "Local-only records",
    detail: "Prescription photos, expiration dates, PD, warranty photos, and reminders are intended to stay on your device unless you choose to open external links.",
  },
  {
    title: "Public tools",
    detail: "Store discovery and external shopping links use internet-based services and third-party destinations that may have their own terms.",
  },
  {
    title: "User control",
    detail: "You control the information you store locally and can remove person profiles or prescriptions directly inside the app.",
  },
];

export default function TermsPage() {
  return (
    <AppShell
      description="A simple summary of how My Optical Wallet is intended to be used and what remains under your control on this device."
      eyebrow="Terms of Service"
      title="Terms of Service"
    >
      <div className="grid gap-4" data-testid="terms-sections-grid">
        {termsSections.map((section) => (
          <section className="vault-card" data-testid={`terms-section-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={section.title}>
            <h2 className="text-xl font-semibold text-[var(--app-text)]">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--app-text-soft)]">{section.detail}</p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
