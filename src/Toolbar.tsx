import BoldIcon from '@mui/icons-material/FormatBold';
import ItalicIcon from '@mui/icons-material/FormatItalic';
import UnderlineIcon from '@mui/icons-material/FormatUnderlined';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import LinkIcon from '@mui/icons-material/Link';
//import LinkOffIcon from '@mui/icons-material/LinkOff';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import type { Editor } from '@tiptap/core';

import styles from './Toolbar.module.css';

interface ToolbarProps {
  editor: Editor;
}

export default function Toolbar({ editor }: ToolbarProps) {
  // Reference: https://tiptap.dev/installation/react#5-the-complete-setup
  return (
    <div className={styles.toolbar}>
      <div className={styles.gutter}>
        <div className={styles.actions}>
          <Stack direction="row" spacing={1}>
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
              onClick={() => editor.chain().focus().unsetAllMarks().setParagraph().run()}
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
            {/*
            <IconButton
              aria-label="unlink"
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.can().chain().focus().unsetLink().run()}
            >
              <LinkOffIcon />
            </IconButton>
            */}
          </Stack>
        </div>
      </div>
    </div>
  );
}
