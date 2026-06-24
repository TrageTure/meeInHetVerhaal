import React from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Check,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Unlink,
  Undo2,
  X,
} from 'lucide-react'
import { normalizeRichText } from '../richText'

export function RichTextEditor({ value, onChange }) {
  const lastEmittedValue = React.useRef('')
  const savedSelection = React.useRef(null)
  const [linkEditor, setLinkEditor] = React.useState({
    open: false,
    url: '',
    canApply: false,
  })
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        heading: {
          levels: [2, 3],
        },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      }),
    ],
    content: normalizeRichText(value),
    editorProps: {
      attributes: {
        class: 'rich-text-input',
        'aria-label': 'Artikeltekst',
      },
      handleKeyDown: (view, event) => {
        if (event.key !== 'Enter') return false

        const { state } = view
        const { $from } = state.selection
        let blockquoteDepth = -1

        for (let depth = $from.depth; depth > 0; depth -= 1) {
          if ($from.node(depth).type.name === 'blockquote') {
            blockquoteDepth = depth
            break
          }
        }

        if (blockquoteDepth === -1) return false

        const insertPosition = $from.after(blockquoteDepth)
        editor
          .chain()
          .insertContentAt(insertPosition, { type: 'paragraph' })
          .setTextSelection(insertPosition + 1)
          .focus()
          .run()

        return true
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextValue = currentEditor.isEmpty ? '' : currentEditor.getHTML()
      lastEmittedValue.current = nextValue
      onChange(nextValue)
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      savedSelection.current = {
        from: currentEditor.state.selection.from,
        to: currentEditor.state.selection.to,
      }
    },
  })

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      blockType: currentEditor?.isActive('heading', { level: 2 })
        ? 'heading-2'
        : currentEditor?.isActive('heading', { level: 3 })
          ? 'heading-3'
          : 'paragraph',
      isBold: currentEditor?.isActive('bold') || false,
      isItalic: currentEditor?.isActive('italic') || false,
      isUnderline: currentEditor?.isActive('underline') || false,
      isBulletList: currentEditor?.isActive('bulletList') || false,
      isOrderedList: currentEditor?.isActive('orderedList') || false,
      isBlockquote: currentEditor?.isActive('blockquote') || false,
      isLink: currentEditor?.isActive('link') || false,
      canUndo: currentEditor?.can().chain().undo().run() || false,
      canRedo: currentEditor?.can().chain().redo().run() || false,
    }),
  })

  React.useEffect(() => {
    if (!editor) return
    if (value === lastEmittedValue.current) return
    const nextContent = normalizeRichText(value)
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false })
    }
    lastEmittedValue.current = value
  }, [editor, value])

  if (!editor) return null

  function changeBlockType(event) {
    const type = event.target.value
    const chain = commandFromSavedSelection()
    if (type === 'heading-2') {
      chain.setHeading({ level: 2 }).run()
    } else if (type === 'heading-3') {
      chain.setHeading({ level: 3 }).run()
    } else {
      chain.setParagraph().run()
    }
  }

  function rememberSelection() {
    savedSelection.current = {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    }
  }

  function commandFromSavedSelection() {
    const chain = editor.chain().focus()
    if (savedSelection.current) {
      chain.setTextSelection(savedSelection.current)
    }
    return chain
  }

  function editLink() {
    rememberSelection()
    const selection = savedSelection.current
    const currentUrl = editor.getAttributes('link').href || ''
    setLinkEditor({
      open: true,
      url: currentUrl || 'https://',
      canApply: selection.from !== selection.to || Boolean(currentUrl),
    })
  }

  function applyLink() {
    const trimmedUrl = linkEditor.url.trim()
    if (!trimmedUrl) {
      commandFromSavedSelection().extendMarkRange('link').unsetLink().run()
      closeLinkEditor()
      return
    }
    const href = /^(https?:\/\/|mailto:|tel:|#)/i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
    commandFromSavedSelection().extendMarkRange('link').setLink({ href }).run()
    closeLinkEditor()
  }

  function removeLink() {
    commandFromSavedSelection().extendMarkRange('link').unsetLink().run()
    closeLinkEditor()
  }

  function closeLinkEditor() {
    setLinkEditor({ open: false, url: '', canApply: false })
    commandFromSavedSelection().run()
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" aria-label="Tekstopmaak">
        <select
          value={editorState.blockType}
          onPointerDown={rememberSelection}
          onChange={changeBlockType}
          aria-label="Tekststijl"
        >
          <option value="paragraph">Gewone tekst</option>
          <option value="heading-2">Tussentitel</option>
          <option value="heading-3">Kleine tussentitel</option>
        </select>
        <span className="toolbar-divider" aria-hidden="true" />
        <ToolbarButton label="Vet" active={editorState.isBold} onClick={() => commandFromSavedSelection().toggleBold().run()}>
          <Bold />
        </ToolbarButton>
        <ToolbarButton label="Cursief" active={editorState.isItalic} onClick={() => commandFromSavedSelection().toggleItalic().run()}>
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          label="Onderlijnen"
          active={editorState.isUnderline}
          onClick={() => commandFromSavedSelection().toggleUnderline().run()}
        >
          <Underline />
        </ToolbarButton>
        <ToolbarButton label="Opsomming" active={editorState.isBulletList} onClick={() => commandFromSavedSelection().toggleBulletList().run()}>
          <List />
        </ToolbarButton>
        <ToolbarButton label="Genummerde lijst" active={editorState.isOrderedList} onClick={() => commandFromSavedSelection().toggleOrderedList().run()}>
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton label="Citaat" active={editorState.isBlockquote} onClick={() => commandFromSavedSelection().toggleBlockquote().run()}>
          <Quote />
        </ToolbarButton>
        <ToolbarButton label={editorState.isLink ? 'Link aanpassen' : 'Link toevoegen'} active={editorState.isLink} onClick={editLink}>
          <Link />
        </ToolbarButton>
        <span className="toolbar-divider" aria-hidden="true" />
        <ToolbarButton label="Ongedaan maken" disabled={!editorState.canUndo} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton label="Opnieuw" disabled={!editorState.canRedo} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 />
        </ToolbarButton>
      </div>
      {linkEditor.open && (
        <div className="rich-text-link-editor">
          <label>
            <span>Link</span>
            <input
              autoFocus
              type="url"
              value={linkEditor.url}
              onChange={(event) => setLinkEditor((current) => ({ ...current, url: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && linkEditor.canApply) {
                  event.preventDefault()
                  applyLink()
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  closeLinkEditor()
                }
              }}
              placeholder="https://..."
            />
          </label>
          {!linkEditor.canApply && <p>Selecteer eerst de tekst waaraan je een link wil toevoegen.</p>}
          <div className="rich-text-link-actions">
            {editorState.isLink && (
              <button type="button" onClick={removeLink} aria-label="Link verwijderen" title="Link verwijderen">
                <Unlink />
              </button>
            )}
            <button type="button" onClick={closeLinkEditor} aria-label="Annuleren" title="Annuleren">
              <X />
            </button>
            <button
              className="confirm-link"
              type="button"
              disabled={!linkEditor.canApply}
              onClick={applyLink}
              aria-label="Link toepassen"
              title="Link toepassen"
            >
              <Check />
            </button>
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({ label, active = false, disabled = false, onClick, children }) {
  return (
    <button
      className={active ? 'active' : ''}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
