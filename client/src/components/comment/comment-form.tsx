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
import { LoginDialog } from "../auth/login-dialog";

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
  const [loginOpen, setLoginOpen] = useState(false);

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

  return (
    <>
      {user ? (
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage
                src={
                  user.avatar ||
                  "/placeholder.svg?height=40&width=40&query=user avatar" ||
                  "/placeholder.svg"
                }
                alt={user.fullname}
              />
              <AvatarFallback className="text-xs sm:text-sm">
                {user.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[80px] sm:min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-sm sm:text-base"
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 gap-2 sm:gap-0">
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                  >
                    <SmileIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                  >
                    <PaperclipIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                  >
                    <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                  >
                    <AtSignIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                  >
                    <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    Ctrl+Enter untuk kirim
                  </span>
                  <span className="text-xs text-gray-400 sm:hidden">
                    Tap untuk kirim
                  </span>

                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || loading}
                    size="sm"
                    className="h-8 sm:h-9 px-3 sm:px-4"
                  >
                    <SendIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span className="text-xs sm:text-sm">Kirim</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Silakan login untuk memberikan komentar
          </p>
          <Button
            onClick={() => setLoginOpen(true)}
            className="w-full sm:w-auto"
          >
            Login
          </Button>
        </div>
      )}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
