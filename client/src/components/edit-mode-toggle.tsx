"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditIcon, SaveIcon, XIcon } from "lucide-react";

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
  hasChanges?: boolean;
}

export function EditModeToggle({
  isEditMode,
  onToggleEdit,
  onSave,
  onCancel,
  loading = false,
  hasChanges = false,
}: EditModeToggleProps) {
  if (isEditMode) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <EditIcon className="w-3 h-3 mr-1" />
          Mode Edit
        </Badge>
        <Button size="sm" onClick={onSave} disabled={loading || !hasChanges}>
          <SaveIcon className="w-4 h-4 mr-2" />
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <XIcon className="w-4 h-4 mr-2" />
          Batal
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={onToggleEdit}>
      <EditIcon className="w-4 h-4 mr-2" />
      Edit Post
    </Button>
  );
}
