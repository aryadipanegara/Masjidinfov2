"use client";

import type { Editor } from "@tiptap/react";
import { Badge } from "@/components/ui/badge";

interface EditorStatsProps {
  editor: Editor;
}

export function EditorStats({ editor }: EditorStatsProps) {
  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground px-4 py-2 border-t">
      <Badge variant="outline">{characterCount} karakter</Badge>
      <Badge variant="outline">{wordCount} kata</Badge>
      <Badge variant="outline">~{readingTime} menit baca</Badge>
    </div>
  );
}
