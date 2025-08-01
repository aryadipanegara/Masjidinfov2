import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageComponent } from "./image-component";

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    insertImage: {
      insertImage: (options: {
        src: string;
        alt?: string;
        caption?: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

export const CustomImage = Node.create<ImageOptions>({
  name: "image",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      caption: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-type='image']",
        getAttrs: (element) => {
          const img = element.querySelector("img");
          const caption = element.querySelector("figcaption");
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            caption: caption?.textContent,
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (element) => ({
          src: element.getAttribute("src"),
          alt: element.getAttribute("alt"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, width } = HTMLAttributes;
    const displayWidth = width ? Math.min(width, 600) : 600;

    const img = [
      "img",
      mergeAttributes(this.options.HTMLAttributes, {
        src,
        alt,
        class: "rounded-lg shadow-md w-full h-auto border border-gray-200",
        style: `max-width: ${displayWidth}px; width: 100%;`,
      }),
    ] as const;

    const wrapper = [
      "div",
      {
        class: "mx-auto",
        style: `max-width: ${displayWidth}px; width: 100%;`,
      },
      img,
    ];

    const figure: [string, Record<string, unknown>, ...unknown[]] = [
      "figure",
      {
        "data-type": "image",
        class: "my-6 text-center",
      },
      wrapper,
    ];

    if (caption) {
      figure.push([
        "figcaption",
        {
          class:
            "mt-3 text-sm text-gray-600 italic text-center bg-gray-50 px-4 py-2 rounded-md border border-gray-100 mx-auto",
          style: `max-width: ${displayWidth}px;`,
        },
        caption,
      ]);
    }

    return figure;
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
