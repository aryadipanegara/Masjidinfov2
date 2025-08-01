"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TipTapEditor from "./tiptap-editor/index";

export default function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Extract images from content
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const images = Array.from(doc.querySelectorAll("img")).map(
        (img, index) => ({
          url: img.src,
          altText: img.alt || null,
          caption: img.getAttribute("data-caption") || null,
          order: index,
        })
      );

      const postData = {
        title,
        content,
        images,
      };

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        alert("Post berhasil dibuat!");
        setTitle("");
        setContent("");
      } else {
        throw new Error("Gagal membuat post");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat membuat post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Buat Post Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Judul Post</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul post..."
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Konten</Label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Mulai menulis konten post Anda..."
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="w-full"
          >
            {isSubmitting ? "Menyimpan..." : "Buat Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
