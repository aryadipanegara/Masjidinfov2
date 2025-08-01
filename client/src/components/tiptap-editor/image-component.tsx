"use client";

import type React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { Node } from "@tiptap/pm/model";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, Check, X } from "lucide-react";
import Image from "next/image";

interface ImageNodeAttributes {
  src?: string;
  caption?: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ImageNodeViewProps extends Omit<NodeViewProps, "node"> {
  node: Node & {
    attrs: ImageNodeAttributes;
  };
}

export const ImageComponent = ({
  node,
  updateAttributes,
  deleteNode,
}: ImageNodeViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(node.attrs.caption || "");
  const [alt, setAlt] = useState(node.attrs.alt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [imageSize, setImageSize] = useState({
    width: node.attrs.width || 600,
    height: node.attrs.height || 400,
  });

  const resizeRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    updateAttributes({
      caption,
      alt,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCaption(node.attrs.caption || "");
    setAlt(node.attrs.alt || "");
    setIsEditing(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = imageSize.width;
    const aspectRatio = imageSize.height / imageSize.width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(800, startWidth + deltaX));
      const newHeight = newWidth * aspectRatio;
      setImageSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      updateAttributes({
        width: imageSize.width,
        height: imageSize.height,
      });
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (node.attrs.width && node.attrs.height) {
      setImageSize({
        width: node.attrs.width,
        height: node.attrs.height,
      });
    }
  }, [node.attrs.width, node.attrs.height]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", alt);
      formData.append("caption", caption);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      updateAttributes({
        src: data.url,
        alt: data.altText,
        caption: data.caption,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Construct full image URL
  const imageUrl = node.attrs.src?.startsWith("http")
    ? node.attrs.src
    : node.attrs.src?.startsWith("/uploads/")
    ? `${node.attrs.src}`
    : node.attrs.src || "/placeholder.svg?height=400&width=600&text=No Image";

  return (
    <NodeViewWrapper className="my-4 text-center">
      <div className="relative group border rounded-lg overflow-hidden max-w-[600px] mx-auto">
        {/* Resizable Image Display */}
        <div
          className="relative inline-block"
          style={{
            width: `${Math.min(imageSize.width, 600)}px`,
            maxWidth: "100%",
          }}
        >
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={node.attrs.alt || "Uploaded image"}
            width={node.attrs.width || 600}
            height={node.attrs.height || 400}
            className="w-full h-auto object-cover rounded"
            style={{
              maxWidth: "600px",
              width: "100%",
            }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              if (!node.attrs.width || !node.attrs.height) {
                updateAttributes({
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
              }
            }}
            onError={(e) => {
              console.error("Image failed to load:", imageUrl);
              const img = e.target as HTMLImageElement;
              img.src =
                "/placeholder.svg?height=400&width=600&text=Image Not Found";
            }}
          />

          {/* Resize Handle */}
          <div
            ref={resizeRef}
            className={`absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity ${
              isResizing ? "opacity-100" : ""
            }`}
            onMouseDown={handleMouseDown}
            style={{
              transform: "translate(50%, 50%)",
            }}
          />

          {/* Size Indicator */}
          {(isResizing || isEditing) && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {Math.round(imageSize.width)} × {Math.round(imageSize.height)}
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
              <div className="text-white">Uploading...</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={deleteNode}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Caption Display (when not editing) */}
        {!isEditing && node.attrs.caption && (
          <div className="p-3 bg-gray-50 border-t">
            <p className="text-sm text-gray-600 italic text-center">
              {node.attrs.caption}
            </p>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="p-4 bg-gray-50 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Masukkan caption untuk gambar..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Deskripsi gambar untuk accessibility..."
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="file-upload">Ganti Gambar</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-1"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-1" />
                Batal
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4 mr-1" />
                Simpan
              </Button>
            </div>
          </div>
        )}

        {/* Add Caption Button (when not editing and no caption) */}
        {!isEditing && !node.attrs.caption && (
          <div className="p-2 bg-gray-50 border-t text-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              + Tambah Caption
            </Button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
