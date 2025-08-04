"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  TwitterIcon,
  FacebookIcon,
  LinkedinIcon,
  LinkIcon,
  CheckIcon,
} from "lucide-react";
import notify from "@/lib/notify";
import { useState } from "react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

export function ShareModal({
  open,
  onOpenChange,
  title,
  url,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title} - ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareToFacebook = () => {
    const shareUrl = encodeURIComponent(url);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    const shareUrl = encodeURIComponent(url);
    const shareTitle = encodeURIComponent(title);
    window.open(
      `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`,
      "_blank"
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    notify.success("Tautan berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Bagikan Post Ini
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Pilih platform untuk berbagi atau salin tautan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 bg-transparent"
            onClick={shareToTwitter}
          >
            <TwitterIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-blue-400" />
            <span className="text-xs sm:text-sm">Twitter</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 bg-transparent"
            onClick={shareToFacebook}
          >
            <FacebookIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-blue-600" />
            <span className="text-xs sm:text-sm">Facebook</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 bg-transparent"
            onClick={shareToLinkedIn}
          >
            <LinkedinIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-blue-700" />
            <span className="text-xs sm:text-sm">LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-3 bg-transparent"
            onClick={copyLink}
          >
            {copied ? (
              <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-green-500" />
            ) : (
              <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-gray-600" />
            )}
            <span className="text-xs sm:text-sm">
              {copied ? "Disalin!" : "Salin Tautan"}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
