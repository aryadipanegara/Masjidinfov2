"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlignCenterIcon, MoveLeftIcon, MoveRightIcon } from "lucide-react";

interface ImageUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string, alt: string, caption: string, align: string) => void;
}

export function ImageUrlDialog({
  open,
  onOpenChange,
  onInsert,
}: ImageUrlDialogProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [imagePreview, setImagePreview] = useState("");

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    // Simple URL validation for preview
    if (url && (url.startsWith("http") || url.startsWith("data:"))) {
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  const handleInsert = () => {
    if (!imageUrl.trim()) return;

    onInsert(imageUrl.trim(), imageAlt.trim(), imageCaption.trim(), imageAlign);

    // Reset form
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
    setImageAlign("center");
    setImagePreview("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
    setImageAlign("center");
    setImagePreview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Image from URL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {imagePreview && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full h-auto rounded max-h-48 mx-auto"
                onError={() => setImagePreview("")}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe the image..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Image caption (optional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-2">
              {[
                ["left", MoveLeftIcon, "Left"],
                ["center", AlignCenterIcon, "Center"],
                ["right", MoveRightIcon, "Right"],
              ].map(([align, Icon, label]) => (
                <Button
                  key={align}
                  variant={imageAlign === align ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageAlign(align as any)}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInsert}
              disabled={!imageUrl.trim()}
              className="flex-1"
            >
              Insert Image
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
