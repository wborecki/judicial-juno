import { forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Link as LinkIcon,
  Undo, Redo,
} from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
}

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  usuarios?: Usuario[];
  onUpdate?: (html: string) => void;
  editable?: boolean;
  minHeight?: string;
}

export interface RichTextEditorRef {
  getHTML: () => string;
  clearContent: () => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content = "", placeholder = "Escreva aqui...", usuarios = [], onUpdate, editable = true, minHeight = "120px" }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ heading: false }),
        Underline,
        Link.configure({ openOnClick: false }),
        Placeholder.configure({ placeholder }),
        Mention.configure({
          HTMLAttributes: { class: "mention" },
          suggestion: {
            items: ({ query }: { query: string }) => {
              return usuarios
                .filter(u => u.nome.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5);
            },
            render: () => {
              let component: HTMLDivElement | null = null;
              let items: Usuario[] = [];
              let selectedIndex = 0;
              let command: ((props: { id: string; label: string }) => void) | null = null;

              const updateList = () => {
                if (!component) return;
                component.innerHTML = items
                  .map((item, index) =>
                    `<button class="mention-item ${index === selectedIndex ? "is-selected" : ""}" data-index="${index}">${item.nome}</button>`
                  )
                  .join("");
                component.querySelectorAll(".mention-item").forEach((el) => {
                  el.addEventListener("click", () => {
                    const idx = parseInt(el.getAttribute("data-index") || "0");
                    const item = items[idx];
                    if (item && command) command({ id: item.id, label: item.nome });
                  });
                });
              };

              return {
                onStart: (props: any) => {
                  component = document.createElement("div");
                  component.classList.add("mention-dropdown");
                  items = props.items;
                  command = props.command;
                  selectedIndex = 0;
                  updateList();
                  if (!props.clientRect) return;
                  const rect = props.clientRect();
                  component.style.position = "fixed";
                  component.style.left = `${rect.left}px`;
                  component.style.top = `${rect.bottom + 4}px`;
                  document.body.appendChild(component);
                },
                onUpdate: (props: any) => {
                  items = props.items;
                  command = props.command;
                  selectedIndex = 0;
                  updateList();
                  if (!props.clientRect || !component) return;
                  const rect = props.clientRect();
                  component.style.left = `${rect.left}px`;
                  component.style.top = `${rect.bottom + 4}px`;
                },
                onKeyDown: (props: any) => {
                  if (props.event.key === "ArrowUp") {
                    selectedIndex = (selectedIndex + items.length - 1) % items.length;
                    updateList();
                    return true;
                  }
                  if (props.event.key === "ArrowDown") {
                    selectedIndex = (selectedIndex + 1) % items.length;
                    updateList();
                    return true;
                  }
                  if (props.event.key === "Enter") {
                    const item = items[selectedIndex];
                    if (item && command) command({ id: item.id, label: item.nome });
                    return true;
                  }
                  return false;
                },
                onExit: () => {
                  component?.remove();
                  component = null;
                },
              };
            },
          },
        }),
      ],
      content,
      editable,
      onUpdate: ({ editor }) => {
        onUpdate?.(editor.getHTML());
      },
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      clearContent: () => editor?.commands.clearContent(),
    }));

    if (!editor) return null;

    const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) => (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
      >
        {children}
      </button>
    );

    return (
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        {editable && (
          <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-border/60 bg-muted/30">
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrito">
              <Bold className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Itálico">
              <Italic className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Sublinhado">
              <UnderlineIcon className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Riscado">
              <Strikethrough className="w-3.5 h-3.5" />
            </ToolBtn>
            <div className="w-px h-4 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista">
              <List className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada">
              <ListOrdered className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citação">
              <Quote className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Código">
              <Code className="w-3.5 h-3.5" />
            </ToolBtn>
            <div className="w-px h-4 bg-border mx-1" />
            <ToolBtn
              onClick={() => {
                const url = window.prompt("URL do link:");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              active={editor.isActive("link")}
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </ToolBtn>
            <div className="w-px h-4 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
              <Undo className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer">
              <Redo className="w-3.5 h-3.5" />
            </ToolBtn>
          </div>
        )}
        <EditorContent editor={editor} className="tiptap-editor" style={{ minHeight }} />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
