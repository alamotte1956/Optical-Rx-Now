import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Compass, LockKeyhole, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ProfileEditorDialog } from "@/components/vault/ProfileEditorDialog";
import { ProfileCard } from "@/components/vault/ProfileCard";
import { useVault } from "@/context/VaultContext";
import { getExpirationStatus, getReminderStatus } from "@/lib/optical-utils";

const utilityCards = [
  { href: "/stores", icon: Compass, label: "Find Local Stores", detail: "Passively senses GPS, shows the city, and uses the internet only for public store discovery.", testId: "dashboard-find-stores-link" },
  { href: "/shop", icon: ShoppingBag, label: "Shop Online", detail: "Open optical partner links without sending prescription details.", testId: "dashboard-shop-link" },
  { href: "/privacy", icon: LockKeyhole, label: "Privacy Info", detail: "See what stays on this device and what uses the internet.", testId: "dashboard-privacy-link" },
];

const footerLinks = [
  { href: "https://myopticalwallet.com/privacy", label: "Privacy", testId: "dashboard-footer-privacy-link" },
  { href: "https://myopticalwallet.com/terms", label: "Terms of Service", testId: "dashboard-footer-terms-link" },
  { href: "https://myopticalwallet.com/support", label: "Support", testId: "dashboard-footer-support-link" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isLoaded, profiles, upsertProfile } = useVault();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const summary = useMemo(() => {
    const currentCount = profiles.filter((profile) => Boolean(profile.prescriptionPhoto)).length;
    const expiredCount = profiles.filter((profile) => getExpirationStatus(profile.expirationDate).tone === "expired").length;
    const dueReminderCount = profiles.filter((profile) => getReminderStatus(profile.reminder).tone !== "muted").length;

    return [
      { label: "Profiles", value: profiles.length },
      { label: "Current prescriptions", value: currentCount },
      { label: "Expired records", value: expiredCount },
      { label: "Reminder plans", value: dueReminderCount },
    ];
  }, [profiles]);

  const handleSaveProfile = async (payload) => {
    await upsertProfile(payload);
    toast.success(payload.id ? "Profile updated locally." : "Profile created locally.");
  };

  return (
    <AppShell
      actions={
        <Button className="w-full sm:w-auto" data-testid="add-profile-button" onClick={() => setIsProfileDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add person
        </Button>
      }
      description="Keep your optical prescriptions handy, organized, and easy to pull up for every family member — while your private vault stays on this device."
      eyebrow="Private vault · no account required"
      onBrandLongPress={() => navigate("/admin")}
      showBrandLogo
      title={<><span className="vault-free-word" data-testid="dashboard-free-highlight">FREE</span> - Your Optical Prescriptions, organized by person</>}
    >
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="dashboard-summary-section">
        {summary.map((item) => (
          <div className="vault-card lg:min-h-[132px]" data-testid={`dashboard-summary-${item.label.toLowerCase().replace(/\s+/g, "-")}`} key={item.label}>
            <p className="vault-eyebrow">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--app-text)] sm:text-4xl">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 space-y-4" data-testid="dashboard-profiles-section">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold" data-testid="dashboard-profiles-title">People in your vault</h2>
            <p className="text-sm text-[var(--app-text-soft)]" data-testid="dashboard-profiles-description">
              Each person gets one current prescription photo, one expiration date, and their own local reminder settings in a simple family-friendly layout.
            </p>
          </div>
        </div>

        {!isLoaded ? (
          <div className="vault-card" data-testid="dashboard-loading-state">Loading your local vault...</div>
        ) : profiles.length === 0 ? (
          <div className="vault-card flex flex-col gap-5" data-testid="dashboard-empty-state">
            <div className="space-y-2">
              <p className="vault-eyebrow">Start simple</p>
              <h3 className="text-2xl font-semibold text-[var(--app-text)]">Add your first person profile</h3>
              <p className="max-w-xl text-sm text-[var(--app-text-soft)]">
                Start with one person, save a signed prescription photo locally, and build out the rest of your family vault only when you need it.
              </p>
            </div>
            <div>
              <Button className="w-full sm:w-auto" data-testid="dashboard-empty-add-profile-button" onClick={() => setIsProfileDialogOpen(true)}>
                <Plus className="h-4 w-4" /> Add first person
              </Button>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-white/45 p-4 text-sm text-[var(--app-text-soft)]" data-testid="dashboard-empty-guidance">
              Tip: once a profile exists, you can save the current prescription photo, add the expiration date, and keep reminders tied only to that person.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3" data-testid="dashboard-utilities-section">
        {utilityCards.map(({ href, icon: Icon, label, detail, testId }) => (
          <Link className="vault-card vault-card-link" data-testid={testId} key={href} to={href}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-brand)]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[var(--app-text)]">{label}</h3>
            <p className="mt-2 text-sm text-[var(--app-text-soft)]">{detail}</p>
          </Link>
        ))}
      </section>

      <section className="mt-8" data-testid="dashboard-footer-links-section">
        <div className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <a className="inline-flex rounded-full border border-[var(--app-border)] bg-white/55 px-4 py-2 text-sm font-medium text-[var(--app-text)] transition hover:bg-white/75" data-testid={link.testId} href={link.href} key={link.href} rel="noreferrer" target="_blank">
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <ProfileEditorDialog onOpenChange={setIsProfileDialogOpen} onSave={handleSaveProfile} open={isProfileDialogOpen} />
    </AppShell>
  );
}
