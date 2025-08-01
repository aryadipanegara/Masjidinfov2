import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Focus from "@tiptap/extension-focus";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import php from "highlight.js/lib/languages/php";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { CustomImage } from "../image-extension";

// Create lowlight instance
const lowlight = createLowlight();

// Register languages
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("python", python);
lowlight.register("java", java);
lowlight.register("php", php);
lowlight.register("sql", sql);
lowlight.register("json", json);

export const getExtensions = () => [
  StarterKit.configure({
    codeBlock: false, // We'll use CodeBlockLowlight instead
  }),

  // Text Formatting
  Underline,
  Subscript,
  Superscript,
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),

  // Typography enhancements
  Typography,

  // Links
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-600 hover:text-blue-800 underline",
    },
  }),

  // Custom Images with caption and alignment support
  CustomImage.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: {
      class: "rounded-lg max-w-full h-auto",
    },
  }),

  // Tables
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,

  // Text Alignment
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),

  // Code Blocks with Syntax Highlighting
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: "javascript",
  }),

  // Task Lists
  TaskList,
  TaskItem.configure({
    nested: true,
  }),

  // Focus mode
  Focus.configure({
    className: "has-focus",
    mode: "all",
  }),

  // Placeholder
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Mulai menulis konten yang menginspirasi...";
    },
  }),

  // Character Count
  CharacterCount.configure({
    limit: 50000,
  }),
];
