import debounce from 'debounce';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { useEditor } from '@tiptap/react';
import { ToastContainer } from 'react-toastify';

import Document from './Document';
import Toolbar from './Toolbar';
import NavMenu from './NavMenu';
import aiKeyboardShortcut from './aiKeyboardShortcut';
import CustomTextAlign from './customTextAlign';

import { documentStore } from './stores';

import type { Editor } from '@tiptap/core';

import 'react-toastify/dist/ReactToastify.css';
import styles from './App.module.css';

function App() {
  //const snap = useSnapshot(documentStore);
  const { content: initialContent } = documentStore;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      CustomTextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: true,
      }),
      Placeholder.configure({
        placeholder:
          window.innerWidth <= 768
            ? `Start writing... then press 'Arkose' to generate text with AI`
            : `Start writing... then press ${
                window.navigator.platform.startsWith('Mac') ? '⌘' : 'Ctrl'
              }+Enter to generate text with AI`,
      }),
      aiKeyboardShortcut,
    ],
    content: JSON.parse(JSON.stringify(initialContent)),
    autofocus: 'end',
    onUpdate: debounce(({ editor }: { editor: Editor }) => {
      if (editor) {
        documentStore.content = editor.getJSON();
      }
    }, 100),
  });
  if (!editor) {
    return <div>Loading...</div>;
  }

  const handleNewDocument = () => {
    editor.commands.setContent('');
    editor.commands.focus(0);
  };

  return (
    <div className={styles.app}>
      <ToastContainer />
      <NavMenu editor={editor} onCreateNewDocument={handleNewDocument} saved={false} />
      <Toolbar editor={editor} />
      <div className={styles.documentContainer}>
        <Document editor={editor} />
      </div>
    </div>
  );
}

export default App;
