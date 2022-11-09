import BoldIcon from '@mui/icons-material/FormatBold';
import ItalicIcon from '@mui/icons-material/FormatItalic';
import UnderlineIcon from '@mui/icons-material/FormatUnderlined';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import LinkIcon from '@mui/icons-material/Link';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import type { Editor } from '@tiptap/core';
import type { Level } from '@tiptap/extension-heading';

import styles from './Toolbar.module.css';
import { MenuItem } from '@mui/material';

interface ToolbarProps {
  editor: Editor;
}

const FONT_FAMILIES = [
  { label: 'Sans', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'Courier New, Courier, monospace' },
];

const FONT_SIZE_TYPES = [
  { label: 'Normal', value: -1 },
  { label: 'Heading 1', value: 1 },
  { label: 'Heading 2', value: 2 },
  { label: 'Heading 3', value: 3 },
  { label: 'Heading 4', value: 4 },
  { label: 'Heading 5', value: 5 },
  { label: 'Heading 6', value: 6 },
];

export default function Toolbar({ editor }: ToolbarProps) {
  // Reference: https://tiptap.dev/installation/react#5-the-complete-setup
  // TODO(ian): Add tooltips with keyboard shortcuts

  const activeNode = editor.state.selection.$head.parent;
  const activeHeading = activeNode.type.name === 'heading' ? activeNode.attrs.level : -1;
  // TODO(ian): Font family state is still inaccurate if a single node has multiple styles.
  const activeFontFamily =
    // @ts-ignore: .content exists on the actual Fragment object
    activeNode.content.content[0]?.marks.attrs?.fontFamily || FONT_FAMILIES[0].value;
  const isCodeActive = editor.isActive('code') || editor.isActive('codeBlock');

  return (
    <div className={styles.toolbar}>
      <div className={styles.gutter}>
        <div className={styles.actions}>
          <Stack direction="row" spacing={1}>
            <TextField
              sx={{
                width: '10ch',
                marginLeft: '-14px',
                '& fieldset': { border: 'none' },
              }}
              select
              value={isCodeActive ? FONT_FAMILIES[2].value : activeFontFamily}
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              size="small"
              disabled={isCodeActive}
            >
              {FONT_FAMILIES.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  style={{ fontFamily: option.value }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              sx={{ width: '14ch', '& fieldset': { border: 'none' } }}
              select
              value={activeHeading}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val === -1) {
                  editor.chain().focus().setParagraph().run()
                } else {
                  const level = val as Level;
                  editor.chain().focus().toggleHeading({ level }).run();
                }
              }}
              size="small"
            >
              {FONT_SIZE_TYPES.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  style={{
                    fontSize: option.value === -1 ? undefined : 17 + (10 - 2 * option.value),
                    fontWeight: option.value === -1 ? undefined : 'bold',
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <IconButton
              edge="start"
              aria-label="bold"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
            >
              <BoldIcon />
            </IconButton>
            <IconButton
              aria-label="italic"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              color={editor.isActive('italic') ? 'primary' : 'default'}
            >
              <ItalicIcon />
            </IconButton>
            <IconButton
              aria-label="underline"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              color={editor.isActive('underline') ? 'primary' : 'default'}
            >
              <UnderlineIcon />
            </IconButton>
            <IconButton
              aria-label="clear format"
              onClick={() =>
                editor.chain().focus().unsetAllMarks().unsetFontFamily().setParagraph().run()
              }
            >
              <FormatClearIcon />
            </IconButton>
            <IconButton
              aria-label="bullet list"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={!editor.can().chain().focus().toggleBulletList().run()}
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
            >
              <FormatListBulletedIcon />
            </IconButton>
            <IconButton
              aria-label="ordered list"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={!editor.can().chain().focus().toggleOrderedList().run()}
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
            >
              <FormatListNumberedIcon />
            </IconButton>
            <IconButton
              aria-label="blockquote"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={!editor.can().chain().focus().toggleBlockquote().run()}
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
            >
              <FormatQuoteIcon />
            </IconButton>
            <IconButton
              aria-label="link"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('Enter a URL', previousUrl);
                if (url === null || url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }}
              disabled={
                !editor.can().chain().focus().unsetLink().run() ||
                editor.view.state.selection.content().size < 1
              }
              color={editor.isActive('link') ? 'primary' : 'default'}
            >
              <LinkIcon />
            </IconButton>
            <IconButton
              aria-label="align left"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              disabled={!editor.can().chain().focus().setTextAlign('left').run()}
              //color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
            >
              <FormatAlignLeftIcon />
            </IconButton>
            <IconButton
              aria-label="align center"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              disabled={!editor.can().chain().focus().setTextAlign('center').run()}
              color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
            >
              <FormatAlignCenterIcon />
            </IconButton>
            <IconButton
              aria-label="align right"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              disabled={!editor.can().chain().focus().setTextAlign('right').run()}
              color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
            >
              <FormatAlignRightIcon />
            </IconButton>
          </Stack>
        </div>
      </div>
    </div>
  );
}
