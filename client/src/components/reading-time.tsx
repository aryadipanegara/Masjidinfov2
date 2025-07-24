"use client";

import { ClockIcon } from "lucide-react";

interface ReadingTimeProps {
  content: string;
}

export function ReadingTime({ content }: ReadingTimeProps) {
  // Calculate reading time based on average reading speed (200 words per minute)
  const calculateReadingTime = (text: string) => {
    // Remove HTML tags and count words
    const plainText = text.replace(/<[^>]*>/g, "");
    const wordCount = plainText.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return readingTime;
  };

  const readingTime = calculateReadingTime(content);

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <ClockIcon className="h-4 w-4" />
      <span>{readingTime} menit baca</span>
    </div>
  );
}
