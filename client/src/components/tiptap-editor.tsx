"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Heading } from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Highlight } from "@tiptap/extension-highlight";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Undo2Icon,
  Redo2Icon,
  ImageIcon,
  LinkIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  TypeIcon,
  PaletteIcon,
  HighlighterIcon,
  ChevronDownIcon,
  MoveLeftIcon,
  MoveRightIcon,
} from "lucide-react";

import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import { ImageService } from "@/service/image.service";

// Custom Image extension with better alignment support
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        renderHTML: (attributes) => ({
          style: `text-align: ${attributes.align}; display: block; margin: ${
            attributes.align === "center"
              ? "0 auto"
              : attributes.align === "right"
              ? "0 0 0 auto"
              : "0 auto 0 0"
          };`,
        }),
      },
      width: {
        default: null,
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      caption: {
        default: "",
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { caption, align, ...attrs } = HTMLAttributes;
    return [
      "div",
      { class: `image-wrapper text-${align || "center"} my-4` },
      ["img", { ...attrs, class: "rounded-lg max-w-full h-auto inline-block" }],
      caption
        ? ["p", { class: "text-sm text-gray-600 italic mt-2" }, caption]
        : null,
    ].filter(Boolean);
  },
});

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (imageId: string, imageUrl: string, caption: string) => void;
  placeholder?: string;
  editable?: boolean;
}

const fontFamilies = [
  { name: "Default", value: "" },
  { name: "Inter", value: "Inter" },
  { name: "Arial", value: "Arial" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Georgia", value: "Georgia" },
  { name: "Comic Sans", value: "Comic Sans MS" },
  { name: "Courier New", value: "Courier New" },
  { name: "Monospace", value: "monospace" },
  { name: "Cursive", value: "cursive" },
  { name: "Exo 2", value: "Exo 2" },
];

const colorPresets = [
  "#000000",
  "#374151",
  "#6B7280",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

export function TipTapEditor({
  content,
  onChange,
  onImageUpload,
  placeholder = "Mulai menulis...",
  editable = true,
}: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3, 4, 5] }),
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline cursor-pointer",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.error("Ukuran file maksimal 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setIsImageDialogOpen(true);
  };

  const handleImageUpload = async () => {
    if (!imageFile || !editor) return;

    setIsUploading(true);
    const toastId = notify.loading("Mengupload gambar...");

    try {
      const res = await ImageService.upload(imageFile);
      const { id: imageId, url } = res.data.data;

      // Insert image with custom attributes
      editor
        .chain()
        .focus()
        .setImage({
          src: url,
          alt: imageAlt,
          title: imageCaption,
          align: imageAlign,
        })
        .createParagraphNear()
        .focus()
        .insertContent(
          `<p class="prose-sm text-${imageAlign} italic text-gray-600 mt-2">${imageCaption}</p>`
        )
        .run();

      onImageUpload?.(imageId, url, imageCaption);
      notify.success("Gambar berhasil diupload!", { id: toastId });

      // Reset form
      setIsImageDialogOpen(false);
      setImagePreview("");
      setImageFile(null);
      setImageAlt("");
      setImageCaption("");
      setImageAlign("center");

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      handleErrorResponse(err, toastId);
    } finally {
      setIsUploading(false);
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  // Handle simple image upload (original method)
  const handleSimpleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.error("Ukuran file maksimal 5MB");
      return;
    }

    const alt = window.prompt("Masukkan alt text untuk gambar:", "") || "";
    const caption = window.prompt("Masukkan caption gambar:", "")?.trim() || "";

    const toastId = notify.loading("Mengupload gambar...");

    try {
      const res = await ImageService.upload(file);
      const { id: imageId, url } = res.data.data;

      editor
        ?.chain()
        .focus()
        .setImage({ src: url, alt, title: caption })
        .createParagraphNear()
        .focus()
        .insertContent(
          `<p class="prose-sm text-center italic text-gray-600 mt-2">${caption}</p>`
        )
        .run();

      onImageUpload?.(imageId, url, caption);
      notify.success("Gambar berhasil diupload!", { id: toastId });
    } catch (err) {
      handleErrorResponse(err, toastId);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
      {editable && (
        <div className="border-b bg-gray-50/50 p-3">
          {/* First Row - Text Formatting */}
          <div className="flex flex-wrap gap-1 items-center mb-2">
            {/* Font Family */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px] justify-between bg-transparent"
                >
                  <TypeIcon className="h-4 w-4 mr-1" />
                  <span className="truncate">
                    {fontFamilies.find(
                      (f) =>
                        f.value === editor.getAttributes("textStyle").fontFamily
                    )?.name || "Font"}
                  </span>
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {fontFamilies.map((font) => (
                  <DropdownMenuItem
                    key={font.value}
                    onClick={() => {
                      if (!font.value) {
                        editor.chain().focus().unsetFontFamily().run();
                      } else {
                        editor.chain().focus().setFontFamily(font.value).run();
                      }
                    }}
                    style={{ fontFamily: font.value || "inherit" }}
                  >
                    {font.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            {/* Basic Formatting */}
            <div className="flex gap-1">
              <Button
                variant={editor.isActive("bold") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold"
              >
                <BoldIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("italic") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic"
              >
                <ItalicIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("strike") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
              >
                <StrikethroughIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("code") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                title="Code"
              >
                <CodeIcon className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Text Color */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" title="Text Color">
                  <PaletteIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <Label>Text Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          editor.chain().focus().setColor(color).run()
                        }
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    onChange={(e) =>
                      editor.chain().focus().setColor(e.target.value).run()
                    }
                    className="w-full h-10"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    className="w-full"
                  >
                    Remove Color
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Highlight */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={editor.isActive("highlight") ? "default" : "ghost"}
                  size="sm"
                  title="Highlight"
                >
                  <HighlighterIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <Label>Highlight Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      "#fef08a",
                      "#fed7aa",
                      "#fecaca",
                      "#ddd6fe",
                      "#bfdbfe",
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHighlight({ color })
                            .run()
                        }
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      editor.chain().focus().unsetHighlight().run()
                    }
                    className="w-full"
                  >
                    Remove Highlight
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Second Row - Structure & Alignment */}
          <div className="flex flex-wrap gap-1 items-center">
            {/* Headings */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => {
                const Icon = [
                  Heading1Icon,
                  Heading2Icon,
                  Heading3Icon,
                  Heading4Icon,
                  Heading5Icon,
                ][level - 1];
                return (
                  <Button
                    key={level}
                    variant={
                      editor.isActive("heading", { level })
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level }).run()
                    }
                    title={`Heading ${level}`}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Text Alignment */}
            <div className="flex gap-1">
              {[
                ["left", AlignLeftIcon, "Align Left"],
                ["center", AlignCenterIcon, "Align Center"],
                ["right", AlignRightIcon, "Align Right"],
                ["justify", AlignJustifyIcon, "Justify"],
              ].map(([align, Icon, title]) => (
                <Button
                  key={align}
                  variant={
                    editor.isActive({ textAlign: align }) ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .setTextAlign(align as any)
                      .run()
                  }
                  title={title as string}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Lists & Quote */}
            <div className="flex gap-1">
              <Button
                variant={editor.isActive("bulletList") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("orderedList") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered List"
              >
                <ListOrderedIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive("blockquote") ? "default" : "ghost"}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Quote"
              >
                <QuoteIcon className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Media & Links */}
            <div className="flex gap-1">
              {/* Advanced Image Upload with Dialog */}
              <Dialog
                open={isImageDialogOpen}
                onOpenChange={setIsImageDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    title="Insert Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full h-auto rounded max-h-48 mx-auto"
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
                            variant={
                              imageAlign === align ? "default" : "outline"
                            }
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
                        onClick={handleImageUpload}
                        disabled={!imageFile || isUploading}
                        className="flex-1"
                      >
                        {isUploading ? "Uploading..." : "Insert Image"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsImageDialogOpen(false);
                          setImagePreview("");
                          setImageFile(null);
                          setImageAlt("");
                          setImageCaption("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Undo/Redo */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
                title="Undo"
              >
                <Undo2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
                title="Redo"
              >
                <Redo2Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <EditorContent
        editor={editor}
        className={`prose prose-sm max-w-none p-6 min-h-[400px] focus:outline-none ${
          !editable ? "cursor-default" : ""
        }`}
      />

      {/* Hidden file input for simple upload (fallback) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
