import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { BellDot, ImagePlus, PencilLine, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ProfileEditorDialog } from "@/components/vault/ProfileEditorDialog";
import { PrescriptionDialog } from "@/components/vault/PrescriptionDialog";
import { useVault } from "@/context/VaultContext";
import {
  formatDateLabel,
  getExpirationStatus,
  getReminderStatus,
  getReminderSummary,
} from "@/lib/optical-utils";
import { fileToDataUrl } from "@/lib/vault-storage";

const toneClasses = {
  active: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  expired: "bg-rose-100 text-rose-800",
  missing: "bg-stone-200 text-stone-700",
};

export default function ProfilePage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const warrantyInputRef = useRef(null);
  const { clearPrescription, deleteProfile, getProfileById, savePrescription, saveWarrantyPhoto, upsertProfile } = useVault();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [showDeletePrescriptionConfirm, setShowDeletePrescriptionConfirm] = useState(false);
  const [showDeleteProfileConfirm, setShowDeleteProfileConfirm] = useState(false);

  const profile = getProfileById(profileId);

  const expirationStatus = useMemo(() => getExpirationStatus(profile?.expirationDate), [profile?.expirationDate]);
  const reminderStatus = useMemo(() => getReminderStatus(profile?.reminder), [profile?.reminder]);

  if (!profile) {
    return <Navigate replace to="/" />;
  }

  const handleWarrantyChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const imageData = await fileToDataUrl(selectedFile);
    await saveWarrantyPhoto(profile.id, imageData);
    toast.success("Warranty photo saved locally.");
  };

  return (
    <AppShell
      actions={
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <Button className="w-full sm:w-auto" data-testid="edit-profile-button" onClick={() => setIsProfileDialogOpen(true)} type="button" variant="outline">
            <PencilLine className="h-4 w-4" /> Edit profile
          </Button>
          <Button className="w-full sm:w-auto" data-testid="replace-prescription-button" onClick={() => setIsPrescriptionDialogOpen(true)} type="button">
            <ImagePlus className="h-4 w-4" /> {profile.prescriptionPhoto ? "Replace Prescription Photo" : "Add Prescription Photo"}
          </Button>
        </div>
      }
      description="Keep the current prescription front and center. Optional PD, warranty photo, and reminder settings stay tied to this person only."
      eyebrow="Person profile"
      title={profile.name}
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:gap-5 xl:grid-cols-[1.25fr,0.85fr]">
        <section className="vault-card" data-testid="profile-current-prescription-section">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[expirationStatus.tone]}`} data-testid="profile-expiration-status-badge">
              {expirationStatus.label}
            </span>
            <span className="text-sm text-[var(--app-text-soft)]" data-testid="profile-expiration-status-detail">
              {expirationStatus.detail}
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[28px] border border-[var(--app-border)] bg-[var(--app-surface-soft)]">
            {profile.prescriptionPhoto ? (
              <img alt={`${profile.name} current prescription`} className="aspect-[4/3] w-full object-cover" data-testid="profile-prescription-photo" src={profile.prescriptionPhoto} />
            ) : (
              <div className="flex aspect-[4/3] flex-col justify-end gap-3 p-6" data-testid="profile-prescription-placeholder">
                <p className="vault-eyebrow">Current Prescription</p>
                <h2 className="text-2xl font-semibold text-[var(--app-text)]">No signed prescription photo saved yet</h2>
                <p className="max-w-md text-sm text-[var(--app-text-soft)]">Add one current prescription photo and a required expiration date. Older photos are not shown as history.</p>
                <div className="rounded-2xl border border-white/60 bg-white/45 p-3 text-sm text-[var(--app-text-soft)]" data-testid="profile-prescription-placeholder-guidance">
                  Next step: use <span className="font-semibold text-[var(--app-text)]">Add Prescription Photo</span> above to keep a single current record for this person.
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:gap-4">
            <div className="rounded-3xl border border-[var(--app-border)] bg-white p-4" data-testid="profile-expiration-card">
              <p className="vault-eyebrow">Expiration</p>
              <p className="mt-3 text-xl font-semibold text-[var(--app-text)]">{formatDateLabel(profile.expirationDate)}</p>
            </div>
            <div className="rounded-3xl border border-[var(--app-border)] bg-white p-4" data-testid="profile-prescription-updated-card">
              <p className="vault-eyebrow">Last updated</p>
              <p className="mt-3 text-xl font-semibold text-[var(--app-text)]">{formatDateLabel(profile.prescriptionUpdatedAt, "Not saved yet")}</p>
            </div>
          </div>
        </section>

        <section className="space-y-5 lg:space-y-4">
          <div className="vault-card" data-testid="profile-details-section">
            <p className="vault-eyebrow">Profile details</p>
            <div className="mt-4 grid gap-4 text-sm text-[var(--app-text-soft)]">
              <div data-testid="profile-name-detail">
                <span className="font-medium text-[var(--app-text)]">Name</span>
                <p className="mt-1">{profile.name}</p>
              </div>
              <div data-testid="profile-pd-detail">
                <span className="font-medium text-[var(--app-text)]">PD</span>
                <p className="mt-1">{profile.pd || "Not added"}</p>
              </div>
            </div>
          </div>

          <div className="vault-card" data-testid="profile-reminder-summary-section">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="vault-eyebrow">Reminder status</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{getReminderSummary(profile.reminder)}</h2>
                <p className="mt-2 text-sm text-[var(--app-text-soft)]" data-testid="profile-reminder-status-detail">{reminderStatus.detail}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-brand)]">
                <BellDot className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <Link className="mt-5 inline-flex text-sm font-medium text-[var(--app-brand)]" data-testid="profile-reminder-center-link" to="/reminders">
              Open reminder center
            </Link>
          </div>

          <div className="vault-card" data-testid="profile-warranty-section">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="vault-eyebrow">Warranty photo</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Optional, local-only</h2>
                <p className="mt-2 text-sm text-[var(--app-text-soft)]">
                  Save one warranty or receipt photo for quick reference.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-brand)]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] border border-[var(--app-border)] bg-[var(--app-surface-soft)]">
              {profile.warrantyPhoto ? (
                <img alt={`${profile.name} warranty`} className="aspect-[4/3] w-full object-cover" data-testid="profile-warranty-photo" src={profile.warrantyPhoto} />
              ) : (
                <div className="flex aspect-[4/3] items-end p-6 text-sm text-[var(--app-text-soft)]" data-testid="profile-warranty-placeholder">
                  No warranty photo saved yet.
                </div>
              )}
            </div>

            <input accept="image/*" className="hidden" data-testid="warranty-photo-input" onChange={handleWarrantyChange} ref={warrantyInputRef} type="file" />
            <Button className="mt-5" data-testid="profile-warranty-upload-button" onClick={() => warrantyInputRef.current?.click()} type="button" variant="outline">
              {profile.warrantyPhoto ? "Replace warranty photo" : "Add warranty photo"}
            </Button>
          </div>

          <div className="vault-card" data-testid="profile-delete-controls-section">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="vault-eyebrow">Manage profile safely</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--app-text)]">Delete only what you choose</h2>
                <p className="mt-2 text-sm text-[var(--app-text-soft)]">
                  You can remove the current prescription without affecting this person’s PD, warranty photo, or reminders — or delete the full profile with confirmation.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-brand)]">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                className="w-full"
                data-testid="delete-prescription-button"
                disabled={!profile.prescriptionPhoto && !profile.expirationDate}
                onClick={() => setShowDeletePrescriptionConfirm(true)}
                type="button"
                variant="outline"
              >
                <Trash2 className="h-4 w-4" /> Delete prescription only
              </Button>
              <Button
                className="w-full border-rose-200/80 bg-rose-50/70 text-rose-700 hover:bg-rose-100/80"
                data-testid="delete-profile-button"
                onClick={() => setShowDeleteProfileConfirm(true)}
                type="button"
                variant="outline"
              >
                <Trash2 className="h-4 w-4" /> Delete full profile
              </Button>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--app-border)] bg-white/45 p-4 text-sm text-[var(--app-text-soft)]" data-testid="profile-delete-guidance">
              Deleting the prescription removes only the current prescription photo and expiration date. Family members and this person’s other details stay intact.
            </div>
          </div>
        </section>
      </div>

      <ProfileEditorDialog initialProfile={profile} onOpenChange={setIsProfileDialogOpen} onSave={async (payload) => {
        await upsertProfile(payload);
        toast.success("Profile updated locally.");
      }} open={isProfileDialogOpen} />

      <PrescriptionDialog
        onOpenChange={setIsPrescriptionDialogOpen}
        onSave={async (payload) => {
          await savePrescription(profile.id, payload);
          toast.success("Current prescription saved locally.");
        }}
        open={isPrescriptionDialogOpen}
        profile={profile}
      />

      <AlertDialog open={showDeletePrescriptionConfirm} onOpenChange={setShowDeletePrescriptionConfirm}>
        <AlertDialogContent className="border-[var(--app-border)] bg-white/90" data-testid="delete-prescription-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="delete-prescription-confirm-title">Delete only the current prescription?</AlertDialogTitle>
            <AlertDialogDescription data-testid="delete-prescription-confirm-description">
              This removes the prescription photo and expiration date for {profile.name}, but keeps PD, warranty photo, reminders, and the person profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3">
            <AlertDialogCancel data-testid="delete-prescription-cancel-button">Keep prescription</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              data-testid="delete-prescription-confirm-button"
              onClick={async () => {
                await clearPrescription(profile.id);
                toast.success("Prescription deleted. The person profile remains saved.");
              }}
            >
              Delete prescription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteProfileConfirm} onOpenChange={setShowDeleteProfileConfirm}>
        <AlertDialogContent className="border-[var(--app-border)] bg-white/90" data-testid="delete-profile-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="delete-profile-confirm-title">Delete {profile.name}’s full profile?</AlertDialogTitle>
            <AlertDialogDescription data-testid="delete-profile-confirm-description">
              This removes the full person profile, including the current prescription, PD, warranty photo, and reminders stored for this person only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3">
            <AlertDialogCancel data-testid="delete-profile-cancel-button">Keep profile</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              data-testid="delete-profile-confirm-button"
              onClick={async () => {
                await deleteProfile(profile.id);
                toast.success("Profile deleted locally.");
                navigate("/");
              }}
            >
              Delete profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
