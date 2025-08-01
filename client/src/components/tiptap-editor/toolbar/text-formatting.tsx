"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  Highlighter,
  Palette,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface TextFormattingProps {
  editor: Editor;
}

const colors = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
];

const highlights = [
  "#FEF3C7",
  "#DBEAFE",
  "#D1FAE5",
  "#FCE7F3",
  "#FEE2E2",
  "#FED7AA",
  "#E0E7FF",
  "#F3E8FF",
];

export function TextFormatting({ editor }: TextFormattingProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Basic Formatting */}
      <Button
        size="sm"
        variant={editor.isActive("bold") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("italic") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("underline") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("strike") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("code") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Subscript & Superscript */}
      <Button
        size="sm"
        variant={editor.isActive("subscript") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        title="Subscript"
      >
        <Subscript className="w-4 h-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("superscript") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        title="Superscript"
      >
        <Superscript className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" title="Text Color">
            <Palette className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <div className="grid grid-cols-4 gap-1 p-2">
            {colors.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                style={{ backgroundColor: color }}
                onClick={() => editor.chain().focus().setColor(color).run()}
                title={`Set text color to ${color}`}
              />
            ))}
          </div>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Remove Color
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant={editor.isActive("highlight") ? "default" : "ghost"}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <div className="grid grid-cols-4 gap-1 p-2">
            {highlights.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                style={{ backgroundColor: color }}
                onClick={() =>
                  editor.chain().focus().toggleHighlight({ color }).run()
                }
                title={`Highlight with ${color}`}
              />
            ))}
          </div>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            Remove Highlight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
