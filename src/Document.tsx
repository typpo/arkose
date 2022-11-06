import React from 'react';

import { useEditor, EditorContent } from '@tiptap/react';

import type { Editor } from '@tiptap/core';

import styles from './Document.module.css';

interface DocumentProps {
  editor: Editor;
}

export default function Document({ editor }: DocumentProps) {
  const handleClick = (event: React.MouseEvent) => {
    editor.commands.focus('end');
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <EditorContent
        editor={editor}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
}
