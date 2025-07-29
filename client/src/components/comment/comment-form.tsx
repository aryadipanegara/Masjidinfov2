"use client";
import { useState } from "react";
import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SmileIcon,
  PaperclipIcon,
  ImageIcon,
  AtSignIcon,
  LinkIcon,
  SendIcon,
} from "lucide-react";
import { useAuth } from "@/app/providers";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = "Tulis komentar...",
  loading,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">
          Silakan login untuk memberikan komentar
        </p>
        <Button>Login</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage
            src={
              user.avatar ||
              "/placeholder.svg?height=40&width=40&query=user avatar"
            }
            alt={user.fullname}
          />
          <AvatarFallback>
            {user.fullname
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <SmileIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <AtSignIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                Ctrl+Enter untuk kirim
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || loading}
                size="sm"
              >
                <SendIcon className="h-4 w-4 mr-1" />
                Kirim
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
