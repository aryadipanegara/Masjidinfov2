"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { getExtensions } from "./extensions";
import { TextFormatting } from "./toolbar/text-formatting";
import { HeadingsAndText } from "./toolbar/headings-and-text";
import { ListsAndBlocks } from "./toolbar/lists-and-blocks";
import { MediaAndEmbeds } from "./toolbar/media-and-embeds";
import { EditorActions } from "./toolbar/editor-actions";
import { EditorStats } from "./editor-stats";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import type { EditorView } from "prosemirror-view";
import type { Slice } from "prosemirror-model";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  className?: string;
}

export function TipTapEditor({
  content,
  onChange,
  onImageUpload,
  className = "",
}: TipTapEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "error"
  >("saved");

  const editor = useEditor({
    extensions: getExtensions(),
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setAutoSaveStatus("saving");
      onChange(editor.getHTML());

      setTimeout(() => {
        setAutoSaveStatus("saved");
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-6 ${
          isFullscreen ? "min-h-[calc(100vh-200px)]" : ""
        }`,
      },
      handleDrop: (
        view: EditorView,
        event: DragEvent,
        _slice: Slice,
        moved: boolean
      ) => {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/") && onImageUpload) {
            event.preventDefault();
            onImageUpload(file).then((url) => {
              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              if (coordinates) {
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view: EditorView, event: ClipboardEvent, _slice: Slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file && onImageUpload) {
              event.preventDefault();
              onImageUpload(file).then((url) => {
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              });
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading editor...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} ${isFullscreen ? "fixed inset-4 z-50" : ""}`}
    >
      {/* Toolbar */}
      <div className="border-b p-2 space-y-2">
        {/* Row 1: Text Formatting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TextFormatting editor={editor} />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              {autoSaveStatus === "saving" && "Menyimpan..."}
              {autoSaveStatus === "saved" && "Tersimpan"}
              {autoSaveStatus === "error" && "Error menyimpan"}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Keluar Fullscreen" : "Masuk Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Row 2: Headings and Text */}
        <div className="flex items-center gap-2">
          <HeadingsAndText editor={editor} />
        </div>

        <Separator />

        {/* Row 3: Lists and Blocks */}
        <div className="flex items-center gap-2">
          <ListsAndBlocks editor={editor} />
        </div>

        <Separator />

        {/* Row 4: Media and Embeds */}
        <div className="flex items-center gap-2">
          <MediaAndEmbeds editor={editor} onImageUpload={onImageUpload} />
        </div>

        <Separator />

        {/* Row 5: Editor Actions */}
        <div className="flex items-center gap-2">
          <EditorActions editor={editor} />
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} className="focus-within:outline-none" />
      </div>

      {/* Stats */}
      <EditorStats editor={editor} />
    </Card>
  );
}

export default TipTapEditor;
