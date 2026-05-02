import { useEffect, useState } from "react";
import { BellDot } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVault } from "@/context/VaultContext";
import {
  CONTACT_CADENCE_OPTIONS,
  EXPIRATION_REMINDER_OPTIONS,
  formatDateLabel,
  getNextReminderDate,
  getReminderStatus,
} from "@/lib/optical-utils";

export default function ReminderCenterPage() {
  const { profiles, saveReminder } = useVault();
  const [drafts, setDrafts] = useState({});
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    const nextDrafts = Object.fromEntries(
      profiles.map((profile) => [
        profile.id,
        {
          enabled: profile.reminder.enabled,
          cadence: profile.reminder.cadence,
          customDays: profile.reminder.customDays,
          startDate: profile.reminder.startDate,
          expirationReminderDays: profile.expirationReminderDays,
        },
      ]),
    );

    setDrafts(nextDrafts);
    if (!activeTab && profiles[0]?.id) {
      setActiveTab(profiles[0].id);
    }
  }, [activeTab, profiles]);

  if (!profiles.length) {
    return (
      <AppShell
        description="Set person-level in-app reminders after you add a profile."
        eyebrow="Reminder center"
        title="Local reminders stay tied to each person"
      >
        <div className="vault-card space-y-4" data-testid="reminders-empty-state">
          <div>
            <p className="vault-eyebrow">Nothing to configure yet</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Add a profile before setting reminders</h2>
            <p className="mt-2 text-sm text-[var(--app-text-soft)]">
              Once you add a person, you can set contact lens cadence and expiration reminder timing just for them.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-white/45 p-4 text-sm text-[var(--app-text-soft)]" data-testid="reminders-empty-guidance">
            This helps families keep reminder schedules separate without mixing records across people.
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      description="Choose daily, biweekly, monthly, or custom contact lens reminders, plus local expiration alerts for each person."
      eyebrow="Reminder center"
      title="In-app reminders by person"
    >
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[28px] bg-[var(--app-surface-soft)] p-2" data-testid="reminder-profile-tabs-list">
          {profiles.map((profile) => (
            <TabsTrigger className="rounded-full px-4 py-2 data-[state=active]:bg-white" data-testid={`reminder-tab-${profile.id}`} key={profile.id} value={profile.id}>
              {profile.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {profiles.map((profile) => {
          const draft = drafts[profile.id] || {
            enabled: false,
            cadence: "monthly",
            customDays: "",
            startDate: new Date().toISOString().slice(0, 10),
            expirationReminderDays: 30,
          };
          const reminderStatus = getReminderStatus(draft);
          const nextReminderDate = getNextReminderDate(draft);

          return (
            <TabsContent className="mt-6" data-testid={`reminder-tab-panel-${profile.id}`} key={profile.id} value={profile.id}>
              <div className="grid gap-6 md:grid-cols-[1.05fr,0.95fr] md:gap-5 lg:grid-cols-[1.15fr,0.85fr]">
                <section className="vault-card" data-testid={`reminder-settings-card-${profile.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="vault-eyebrow">Contact lens cadence</p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{profile.name}</h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-brand)]">
                      <BellDot className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5">
                    <label className="flex items-center justify-between rounded-3xl border border-[var(--app-border)] bg-white px-4 py-4" data-testid={`reminder-enabled-row-${profile.id}`}>
                      <span className="text-sm font-medium text-[var(--app-text)]">Enable lens replacement reminder</span>
                      <input
                        checked={draft.enabled}
                        className="h-5 w-5 accent-[var(--app-brand)]"
                        data-testid={`reminder-enabled-input-${profile.id}`}
                        onChange={(event) => setDrafts((current) => ({
                          ...current,
                          [profile.id]: { ...draft, enabled: event.target.checked },
                        }))}
                        type="checkbox"
                      />
                    </label>

                    <div className="space-y-2">
                      <label className="vault-field-label" data-testid={`reminder-cadence-label-${profile.id}`} htmlFor={`reminder-cadence-${profile.id}`}>
                        Replacement cadence
                      </label>
                      <select
                        className="vault-select"
                        data-testid={`reminder-cadence-select-${profile.id}`}
                        id={`reminder-cadence-${profile.id}`}
                        onChange={(event) => setDrafts((current) => ({
                          ...current,
                          [profile.id]: { ...draft, cadence: event.target.value },
                        }))}
                        value={draft.cadence}
                      >
                        {CONTACT_CADENCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    {draft.cadence === "custom" ? (
                      <div className="space-y-2">
                        <label className="vault-field-label" data-testid={`reminder-custom-days-label-${profile.id}`} htmlFor={`reminder-custom-days-${profile.id}`}>
                          Custom interval in days
                        </label>
                        <Input
                          data-testid={`reminder-custom-days-input-${profile.id}`}
                          id={`reminder-custom-days-${profile.id}`}
                          min="1"
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [profile.id]: { ...draft, customDays: event.target.value },
                          }))}
                          type="number"
                          value={draft.customDays}
                        />
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <label className="vault-field-label" data-testid={`reminder-start-date-label-${profile.id}`} htmlFor={`reminder-start-date-${profile.id}`}>
                        Last replacement date
                      </label>
                      <Input
                        data-testid={`reminder-start-date-input-${profile.id}`}
                        id={`reminder-start-date-${profile.id}`}
                        onChange={(event) => setDrafts((current) => ({
                          ...current,
                          [profile.id]: { ...draft, startDate: event.target.value },
                        }))}
                        type="date"
                        value={draft.startDate}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="vault-field-label" data-testid={`expiration-reminder-label-${profile.id}`} htmlFor={`expiration-reminder-${profile.id}`}>
                        Expiration reminder timing
                      </label>
                      <select
                        className="vault-select"
                        data-testid={`expiration-reminder-select-${profile.id}`}
                        id={`expiration-reminder-${profile.id}`}
                        onChange={(event) => setDrafts((current) => ({
                          ...current,
                          [profile.id]: { ...draft, expirationReminderDays: Number(event.target.value) },
                        }))}
                        value={draft.expirationReminderDays}
                      >
                        {EXPIRATION_REMINDER_OPTIONS.map((value) => (
                          <option key={value} value={value}>{value} days before expiration</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button className="mt-6" data-testid={`save-reminder-button-${profile.id}`} onClick={async () => {
                    await saveReminder(profile.id, draft);
                    toast.success(`${profile.name}'s reminders saved locally.`);
                  }} type="button">
                    Save reminder settings
                  </Button>
                </section>

                <section className="space-y-4">
                  <div className="vault-card" data-testid={`reminder-status-card-${profile.id}`}>
                    <p className="vault-eyebrow">Status</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{reminderStatus.label}</h2>
                    <p className="mt-2 text-sm text-[var(--app-text-soft)]">{reminderStatus.detail}</p>
                  </div>

                  <div className="vault-card" data-testid={`reminder-next-date-card-${profile.id}`}>
                    <p className="vault-eyebrow">Next contact lens reminder</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--app-text)]">{formatDateLabel(nextReminderDate)}</p>
                  </div>

                  <div className="vault-card" data-testid={`reminder-expiration-settings-card-${profile.id}`}>
                    <p className="vault-eyebrow">Expiration warning</p>
                    <p className="mt-3 text-sm text-[var(--app-text-soft)]">
                      Show this person’s expiration reminder {draft.expirationReminderDays} days before the current prescription expires.
                    </p>
                  </div>
                </section>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </AppShell>
  );
}
