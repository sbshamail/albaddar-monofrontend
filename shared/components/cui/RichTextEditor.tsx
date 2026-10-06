"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  Code as CodeIcon,
  ItalicIcon,
  Link as LinkIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react";
import { useEffect } from "react";

import { cn } from "../../lib/utils";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { RICH_TEXT_CLASSNAME } from "./richTextClassName";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

// What the toolbar shows before the editor has dispatched its first
// transaction (see the toolbarState comment below).
const IDLE_TOOLBAR_STATE = {
  bold: false,
  italic: false,
  code: false,
  bulletList: false,
  orderedList: false,
  link: false,
  blockType: "paragraph",
};

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      // Tiptap loses text selection on blur — mousedown (before the editor
      // blurs) plus preventDefault is what keeps the toolbar's target
      // command applying to the selection the user actually made.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * WYSIWYG editor (paragraph/heading 1-6, bold/italic/code, lists, links)
 * that reads and writes plain HTML — a drop-in swap for a plain
 * `<textarea>` bound to a string field, no different storage shape on
 * either end. Domain-agnostic (no knowledge of products/shops/etc.), so it
 * lives in shared/ rather than a specific app's common/.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [...HEADING_LEVELS] },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // Tailwind's preflight strips default list-style/margins from
        // ul/ol/li — restored explicitly here since there's no
        // @tailwindcss/typography plugin in this project to do it for us.
        class: cn(
          RICH_TEXT_CLASSNAME,
          "min-h-24 px-2.5 py-1.5 text-sm outline-none",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // `content` above only seeds the editor's INITIAL document — Tiptap never
  // re-reads it after that, so a `value` change from outside (e.g. the
  // admin's "Generate with AI" panel calling form.setValue on this field)
  // was silently ignored, leaving the editor showing stale/empty content.
  // Skipped whenever the incoming value already matches the editor's own
  // HTML, so normal typing (each keystroke's onUpdate round-trips through
  // this same value) never fights the cursor.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // editor.isActive(...) itself doesn't trigger a re-render on pure
  // selection changes (clicking into a heading without typing) — only
  // onUpdate did, so the toolbar could show stale active/highlighted state.
  // useEditorState subscribes to every transaction, so this stays correct
  // for both the button highlights and the block-type dropdown below.
  const liveToolbarState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null;
      const e = ctx.editor;
      const headingLevel = HEADING_LEVELS.find((level) =>
        e.isActive("heading", { level }),
      );
      return {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        code: e.isActive("code"),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        link: e.isActive("link"),
        blockType: headingLevel ? String(headingLevel) : "paragraph",
      };
    },
  });

  // useEditorState only recomputes on an editor transaction, so right after
  // the editor is created it can still be null. An editor opened on content
  // that already matches `value` (e.g. editing a saved record) never
  // dispatches that first transaction — returning null here left the whole
  // editor invisible. Fall back to an idle toolbar instead.
  const toolbarState = liveToolbarState ?? IDLE_TOOLBAR_STATE;

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setBlockType = (next: string) => {
    if (next === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(next) as (typeof HEADING_LEVELS)[number];
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1.5 py-1">
        <NativeSelect
          size="sm"
          aria-label="Text style"
          value={toolbarState.blockType}
          onChange={(e) => setBlockType(e.target.value)}
          className="mr-1 w-[6.5rem]"
        >
          <NativeSelectOption value="paragraph">Paragraph</NativeSelectOption>
          {HEADING_LEVELS.map((level) => (
            <NativeSelectOption key={level} value={String(level)}>
              Heading {level}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <ToolbarButton
          label="Bold"
          active={toolbarState.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={toolbarState.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code"
          active={toolbarState.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={toolbarState.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={toolbarState.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={toolbarState.link}
          onClick={setLink}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
