import { Link } from "react-router-dom";
import { BellDot, ChevronRight, NotebookPen, Ruler } from "lucide-react";

import { getExpirationStatus, getReminderSummary, formatDateLabel } from "@/lib/optical-utils";

const statusToneClasses = {
  active: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  expired: "bg-rose-100 text-rose-800",
  missing: "bg-stone-200 text-stone-700",
};

export const ProfileCard = ({ profile }) => {
  const expirationStatus = getExpirationStatus(profile.expirationDate);

  return (
    <Link
      className="vault-card vault-card-link group"
      data-testid={`profile-card-${profile.id}`}
      to={`/profiles/${profile.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="vault-avatar" data-testid={`profile-avatar-${profile.id}`}>
            {profile.name.slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0 space-y-1">
            <h2 className="truncate text-xl font-semibold" data-testid={`profile-name-${profile.id}`}>
              {profile.name}
            </h2>
            <p className="text-sm text-[var(--app-text-soft)]" data-testid={`profile-expiration-${profile.id}`}>
              {profile.expirationDate
                ? `Expires ${formatDateLabel(profile.expirationDate)}`
                : "No current prescription yet"}
            </p>
          </div>
        </div>

        <ChevronRight className="mt-1 h-5 w-5 text-[var(--app-text-soft)] transition-transform duration-200 group-hover:translate-x-1" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="vault-prescription-preview" data-testid={`profile-prescription-preview-${profile.id}`}>
          {profile.prescriptionPhoto ? (
            <img
              alt={`${profile.name} prescription`}
              className="h-full w-full object-cover"
              src={profile.prescriptionPhoto}
            />
          ) : (
            <div className="flex h-full flex-col justify-end gap-2 p-4 text-left text-sm text-[var(--app-text-soft)]">
              <span className="vault-eyebrow">Current Prescription</span>
              <p className="max-w-[18rem] text-base text-[var(--app-text)]">Add a signed prescription photo and required expiration date.</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusToneClasses[expirationStatus.tone]}`}
              data-testid={`profile-status-badge-${profile.id}`}
            >
              {expirationStatus.label}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--app-text-soft)]" data-testid={`profile-status-detail-${profile.id}`}>
              {expirationStatus.detail}
            </span>
          </div>

          <div className="grid gap-2 text-sm text-[var(--app-text-soft)]">
            <div className="vault-inline-meta" data-testid={`profile-pd-${profile.id}`}>
              <Ruler className="h-4 w-4" aria-hidden="true" />
              <span>{profile.pd ? `PD ${profile.pd}` : "PD not added"}</span>
            </div>

            <div className="vault-inline-meta" data-testid={`profile-reminder-${profile.id}`}>
              <BellDot className="h-4 w-4" aria-hidden="true" />
              <span>{getReminderSummary(profile.reminder)}</span>
            </div>

            <div className="vault-inline-meta" data-testid={`profile-warranty-${profile.id}`}>
              <NotebookPen className="h-4 w-4" aria-hidden="true" />
              <span>{profile.warrantyPhoto ? "Warranty photo saved" : "No warranty photo"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
