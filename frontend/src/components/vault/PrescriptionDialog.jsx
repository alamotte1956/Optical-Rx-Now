import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fileToDataUrl } from "@/lib/vault-storage";

export const PrescriptionDialog = ({ onOpenChange, onSave, open, profile }) => {
  const [expirationDate, setExpirationDate] = useState("");
  const [preview, setPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setExpirationDate(profile?.expirationDate || "");
    setPreview("");
    setShowReplaceConfirm(false);
  }, [open, profile]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const dataUrl = await fileToDataUrl(selectedFile);
    setPreview(dataUrl);
  };

  const commitSave = async () => {
    setIsSaving(true);
    await onSave({ expirationDate, photoDataUrl: preview });
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (profile?.prescriptionPhoto) {
      setShowReplaceConfirm(true);
      return;
    }

    await commitSave();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="vault-dialog-content border-[var(--app-border)] bg-white sm:max-w-2xl" data-testid="prescription-dialog">
          <DialogHeader>
            <DialogTitle data-testid="prescription-dialog-title">
              {profile?.prescriptionPhoto ? "Replace Prescription Photo" : "Add Current Prescription"}
            </DialogTitle>
            <DialogDescription data-testid="prescription-dialog-description">
              Save the signed prescription photo only. The current photo stays in place until the new one is confirmed saved.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="vault-upload-panel" data-testid="prescription-photo-upload-panel" htmlFor="prescription-photo-input">
                <input
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  data-testid="prescription-photo-input"
                  id="prescription-photo-input"
                  onChange={handleFileChange}
                  type="file"
                />
                <span className="vault-eyebrow">Signed photo only</span>
                <span className="text-lg font-semibold text-[var(--app-text)]">Capture or upload the current prescription</span>
                <span className="text-sm text-[var(--app-text-soft)]">
                  No manual Rx entry, no OCR, no history.
                </span>
              </label>

              <div className="vault-preview-panel" data-testid="prescription-photo-preview-panel">
                {preview ? (
                  <img alt={`${profile?.name} new prescription preview`} className="h-full w-full object-cover" src={preview} />
                ) : profile?.prescriptionPhoto ? (
                  <img alt={`${profile?.name} current prescription`} className="h-full w-full object-cover opacity-80" src={profile.prescriptionPhoto} />
                ) : (
                  <div className="flex h-full items-end p-4 text-sm text-[var(--app-text-soft)]">
                    Your current prescription photo preview appears here.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="vault-field-label" data-testid="expiration-date-label" htmlFor="prescription-expiration-date">
                Expiration date
              </label>
              <Input
                data-testid="expiration-date-input"
                id="prescription-expiration-date"
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setExpirationDate(event.target.value)}
                required
                type="date"
                value={expirationDate}
              />
            </div>

            <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm text-[var(--app-text-soft)]" data-testid="prescription-save-guidance">
              Use <span className="font-semibold text-[var(--app-text)]">Replace Prescription Photo</span> to overwrite the current record. Older photos are not browsable or managed as history.
            </div>

            <DialogFooter className="gap-3 sm:gap-3">
              <Button data-testid="prescription-cancel-button" onClick={() => onOpenChange(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button data-testid="save-prescription-button" disabled={!preview || !expirationDate || isSaving} type="submit">
                {isSaving ? "Saving..." : profile?.prescriptionPhoto ? "Replace Prescription Photo" : "Save Current Prescription"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
        <AlertDialogContent className="border-[var(--app-border)] bg-white" data-testid="replace-prescription-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="replace-prescription-confirm-title">Overwrite the current prescription?</AlertDialogTitle>
            <AlertDialogDescription data-testid="replace-prescription-confirm-description">
              This replaces the current prescription photo and updates the expiration date after the new save is confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3">
            <AlertDialogCancel className="border-[var(--app-border)]" data-testid="replace-prescription-cancel-button">
              Keep current photo
            </AlertDialogCancel>
            <AlertDialogAction className="bg-[var(--app-brand)] text-white hover:bg-[var(--app-brand-strong)]" data-testid="save-prescription-confirm-button" onClick={commitSave}>
              Confirm replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
