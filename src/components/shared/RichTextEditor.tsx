"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlignExtension from "@tiptap/extension-text-align";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import { useCallback, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Link, Image, AlignLeft, AlignCenter, AlignRight,
  Quote, Code, Undo2, Redo2, Heading1, Heading2, Heading3,
  Minus, Eye, Code2, Pilcrow,
} from "lucide-react";

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-indigo-500/20 text-indigo-300"
          : "text-[#9090a8] hover:bg-[#18181f] hover:text-[#e2e2ea]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-[rgba(255,255,255,0.06)] mx-0.5" />;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your newsletter...",
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [sourceMode, setSourceMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: "color: #818cf8; text-decoration: underline;",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          style: "max-width: 100%; border-radius: 8px; margin: 16px 0;",
        },
      }),
      UnderlineExtension,
      TextAlignExtension.configure({
        types: ["heading", "paragraph"],
      }),
      PlaceholderExtension.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[320px] px-4 py-3 " +
          "text-[#e2e2ea] leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="border border-[rgba(255,255,255,0.07)] rounded-lg bg-[#0a0a0f] min-h-[320px] flex items-center justify-center">
        <span className="text-[#55556a] text-sm">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="border border-[rgba(255,255,255,0.07)] rounded-lg bg-[#0a0a0f] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-[rgba(255,255,255,0.06)] bg-[#08080c]">
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph")}
            title="Paragraph"
          >
            <Pilcrow className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered list"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Insert link">
            <Link className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="Insert image">
            <Image className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => setSourceMode(!sourceMode)}
            active={sourceMode}
            title={sourceMode ? "Switch to visual editor" : "Switch to HTML source"}
          >
            {sourceMode ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
          </ToolbarButton>
        </div>
      </div>

      {/* Editor content */}
      {sourceMode ? (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[320px] px-4 py-3 bg-[#0a0a0f] text-sm text-[#e2e2ea] font-mono focus:outline-none resize-y"
          placeholder="<p>Edit HTML source...</p>"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}
