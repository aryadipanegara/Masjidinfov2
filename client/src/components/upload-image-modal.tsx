"use client";

import type React from "react";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageService } from "@/service/image.service";
import notify from "@/lib/notify";
import handleErrorResponse from "@/utils/handleErrorResponse";
import type { Post } from "@/types/posts.types";

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  posts: Post[];
}

export default function UploadImageModal({
  isOpen,
  onClose,
  onUploadSuccess,
  posts,
}: UploadImageModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postId, setPostId] = useState<string>("none");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        notify.error(`${file.name} bukan file gambar`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        notify.error(`${file.name} terlalu besar (maksimal 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      notify.error("Pilih file gambar terlebih dahulu");
      return;
    }

    setIsUploading(true);
    const toastId = notify.loading("Mengupload gambar...");

    try {
      const uploadPromises = selectedFiles.map((file) =>
        ImageService.upload(file, {
          postId: postId === "none" ? undefined : postId,
          altText: altText || undefined,
          caption: caption || undefined,
        })
      );

      await Promise.all(uploadPromises);
      notify.success(
        `${selectedFiles.length} gambar berhasil diupload!`,
        toastId
      );

      setSelectedFiles([]);
      setPostId("none");
      setAltText("");
      setCaption("");

      onUploadSuccess();
      onClose();
    } catch (error) {
      handleErrorResponse(error, toastId);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setPostId("none");
      setAltText("");
      setCaption("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Gambar</DialogTitle>
          <DialogDescription>
            Upload gambar baru dengan informasi tambahan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div>
            <Label htmlFor="file-upload">Pilih Gambar</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>File Terpilih ({selectedFiles.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Selection */}
          <div>
            <Label htmlFor="post-select">Post (Opsional)</Label>
            <Select
              value={postId}
              onValueChange={setPostId}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih post atau kosongkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada post</SelectItem>{" "}
                {/* Updated value prop to "none" */}
                {posts?.map((post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alt Text */}
          <div>
            <Label htmlFor="alt-text">Alt Text (Opsional)</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Deskripsi gambar untuk aksesibilitas"
              disabled={isUploading}
            />
          </div>

          {/* Caption */}
          <div>
            <Label htmlFor="caption">Caption (Opsional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption atau deskripsi gambar"
              disabled={isUploading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Mengupload..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
