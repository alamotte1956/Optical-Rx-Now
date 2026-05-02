import { AppShell } from "@/components/layout/AppShell";

const supportTopics = [
  "Adding or replacing the current prescription photo",
  "Managing person profiles and family records",
  "Understanding local-only privacy storage",
  "Using store discovery and affiliate links safely",
  "Resetting age verification or local data from the admin panel",
];

export default function SupportPage() {
  return (
    <AppShell
      description="Quick guidance for the most common setup, privacy, and record-management questions inside My Optical Wallet."
      eyebrow="Support"
      title="Support"
    >
      <section className="vault-card" data-testid="support-overview-card">
        <h2 className="text-2xl font-semibold text-[var(--app-text)]">How can we help?</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--app-text-soft)]">
          If you need help using the app, start with the topics below. Most record and privacy controls are available directly inside the vault and admin tools.
        </p>
      </section>

      <div className="mt-4 grid gap-4" data-testid="support-topics-grid">
        {supportTopics.map((topic) => (
          <div className="vault-card" data-testid={`support-topic-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={topic}>
            <p className="text-base font-medium text-[var(--app-text)]">{topic}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
