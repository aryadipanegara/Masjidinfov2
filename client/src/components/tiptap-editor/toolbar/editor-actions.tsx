"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Undo, Redo, Download, Copy, Scissors, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface EditorActionsProps {
  editor: Editor;
}

export function EditorActions({ editor }: EditorActionsProps) {
  const copyContent = () => {
    const html = editor.getHTML();
    navigator.clipboard.writeText(html);
  };

  const clearContent = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua konten?")) {
      editor.chain().focus().clearContent().run();
    }
  };

  const exportContent = (format: string) => {
    let content = "";
    let filename = "document";
    let mimeType = "text/plain";

    switch (format) {
      case "html":
        content = editor.getHTML();
        filename = "document.html";
        mimeType = "text/html";
        break;
      case "text":
        content = editor.getText();
        filename = "document.txt";
        mimeType = "text/plain";
        break;
      case "json":
        content = JSON.stringify(editor.getJSON(), null, 2);
        filename = "document.json";
        mimeType = "application/json";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Undo/Redo */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Copy/Clear */}
      <Button size="sm" variant="ghost" onClick={copyContent} title="Copy HTML">
        <Copy className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={clearContent}
        title="Clear Content"
      >
        <Scissors className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" title="Export">
            <Download className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => exportContent("html")}>
            <FileText className="w-4 h-4 mr-2" />
            Export as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportContent("text")}>
            <FileText className="w-4 h-4 mr-2" />
            Export as Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportContent("json")}>
            <FileText className="w-4 h-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
