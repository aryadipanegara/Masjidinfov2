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
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

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
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {/* Essential formatting - always visible */}
      <Button
        size="sm"
        variant={editor.isActive("bold") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
      >
        <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive("italic") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
      >
        <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>

      {/* Show underline on tablet and up */}
      <Button
        size="sm"
        variant={editor.isActive("underline") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
        className="hidden md:flex h-8 w-8 p-0 sm:h-9 sm:w-9"
      >
        <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>

      {/* Show code on desktop */}
      <Button
        size="sm"
        variant={editor.isActive("code") ? "default" : "ghost"}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
        className="hidden lg:flex h-8 w-8 p-0 sm:h-9 sm:w-9"
      >
        <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>

      {/* Separator - hidden on mobile */}
      <Separator
        orientation="vertical"
        className="h-4 sm:h-6 hidden sm:block"
      />

      {/* Color picker - always visible but responsive */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            title="Text Color"
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 sm:w-48">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 p-2">
            {colors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => editor.chain().focus().setColor(color).run()}
                title={`Set text color to ${color}`}
              />
            ))}
          </div>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-xs sm:text-sm"
          >
            Remove Color
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight - visible on tablet and up */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant={editor.isActive("highlight") ? "default" : "ghost"}
            title="Highlight"
            className="hidden sm:flex h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <Highlighter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 sm:w-48">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 p-2">
            {highlights.map((color) => (
              <button
                key={color}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
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
            className="text-xs sm:text-sm"
          >
            Remove Highlight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* More options dropdown for mobile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            title="More formatting options"
            className="md:hidden h-8 w-8 p-0"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="flex items-center gap-2"
          >
            <Underline className="w-4 h-4" />
            <span>Underline</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="flex items-center gap-2"
          >
            <Strikethrough className="w-4 h-4" />
            <span>Strikethrough</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleCode().run()}
            className="flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            <span>Inline Code</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className="flex items-center gap-2"
          >
            <Subscript className="w-4 h-4" />
            <span>Subscript</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className="flex items-center gap-2"
          >
            <Superscript className="w-4 h-4" />
            <span>Superscript</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Desktop-only advanced formatting */}
      <div className="hidden md:flex items-center gap-0.5 sm:gap-1">
        <Separator orientation="vertical" className="h-4 sm:h-6" />

        <Button
          size="sm"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
        >
          <Strikethrough className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("subscript") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          title="Subscript"
          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
        >
          <Subscript className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("superscript") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          title="Superscript"
          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
        >
          <Superscript className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}
