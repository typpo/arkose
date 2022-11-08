import { EditorContent } from '@tiptap/react';

import type { Editor } from '@tiptap/core';

import styles from './Document.module.css';

interface DocumentProps {
  editor: Editor;
}

export default function Document({ editor }: DocumentProps) {
  return (
    <div className={styles.page}>
      <EditorContent
        // @ts-ignore: Known issue https://github.com/ueberdosis/tiptap/issues/1344
        editor={editor}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    </div>
  );
}
