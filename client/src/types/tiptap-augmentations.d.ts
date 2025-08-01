import type { Commands } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    setImage: {
      setImage: (options: {
        src: string;
        alt?: string;
        caption?: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}
