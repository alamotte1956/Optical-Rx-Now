import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const defaultForm = { id: "", name: "", pd: "" };

export const ProfileEditorDialog = ({ initialProfile, onOpenChange, onSave, open }) => {
  const [formState, setFormState] = useState(defaultForm);
  const isEditing = Boolean(initialProfile?.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState({
      id: initialProfile?.id || "",
      name: initialProfile?.name || "",
      pd: initialProfile?.pd || "",
    });
  }, [initialProfile, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(formState);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="vault-dialog-content border-[var(--app-border)] bg-white sm:max-w-lg" data-testid="profile-editor-dialog">
        <DialogHeader>
          <DialogTitle data-testid="profile-editor-title">
            {isEditing ? "Edit person profile" : "Add a person profile"}
          </DialogTitle>
          <DialogDescription data-testid="profile-editor-description">
            Keep records separate for each family member. Only the current prescription photo and privacy-safe details are stored on this device.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="vault-field-label" data-testid="profile-name-label" htmlFor="profile-name">
              Person name
            </label>
            <Input
              data-testid="profile-name-input"
              id="profile-name"
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ex: Maya"
              required
              value={formState.name}
            />
          </div>

          <div className="space-y-2">
            <label className="vault-field-label" data-testid="profile-pd-label" htmlFor="profile-pd">
              PD (optional)
            </label>
            <Input
              data-testid="profile-pd-input"
              id="profile-pd"
              onChange={(event) => setFormState((current) => ({ ...current, pd: event.target.value }))}
              placeholder="Ex: 63"
              value={formState.pd}
            />
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button data-testid="profile-editor-cancel-button" onClick={() => onOpenChange(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button data-testid="profile-editor-save-button" type="submit">
              {isEditing ? "Save profile" : "Create profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
